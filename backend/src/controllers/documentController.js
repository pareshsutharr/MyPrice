import mongoose from 'mongoose'
import { DocumentItem } from '../models/DocumentItem.js'
import { MAX_VAULT_BYTES } from '../middleware/upload.js'

const { ObjectId } = mongoose.Types

const sanitizeName = (value, fallback = 'Untitled') => {
  const trimmed = String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
  if (!trimmed) return fallback
  return trimmed.slice(0, 120)
}

const normalizeParentId = (parentId) => {
  if (!parentId || parentId === 'root') return null
  if (!ObjectId.isValid(parentId)) {
    throw new Error('Invalid parent folder id')
  }
  return parentId
}

const loadFolder = async (folderId, userId) => {
  if (!folderId) return null
  const folder = await DocumentItem.findOne({ _id: folderId, user: userId, kind: 'folder' })
  if (!folder) {
    throw new Error('Folder not found')
  }
  return folder
}

const serializeItem = (item) => ({
  id: item._id.toString(),
  name: item.name,
  kind: item.kind,
  parent: item.parent ? item.parent.toString() : null,
  mimeType: item.mimeType ?? null,
  size: item.size ?? 0,
  isImage: Boolean(item.isImage),
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
})

const buildBreadcrumbs = async (folder, userId) => {
  if (!folder) return []

  const crumbs = []
  let current = folder

  while (current) {
    crumbs.unshift({ id: current._id.toString(), name: current.name })
    if (!current.parent) break
    current = await DocumentItem.findOne({
      _id: current.parent,
      user: userId,
      kind: 'folder',
    }).select('_id name parent')
  }

  return crumbs
}

const buildFolderPathMap = (folders) => {
  const byId = new Map(folders.map((folder) => [folder._id.toString(), folder]))
  const cache = new Map()

  const resolvePath = (folder) => {
    const id = folder._id.toString()
    if (cache.has(id)) return cache.get(id)
    if (!folder.parent) {
      cache.set(id, folder.name)
      return folder.name
    }
    const parent = byId.get(folder.parent.toString())
    const path = parent ? `${resolvePath(parent)} / ${folder.name}` : folder.name
    cache.set(id, path)
    return path
  }

  return folders.map((folder) => ({
    id: folder._id.toString(),
    name: folder.name,
    parent: folder.parent ? folder.parent.toString() : null,
    path: resolvePath(folder),
  }))
}

const getFolderDescendantIds = async (folderIds, userId) => {
  const seen = new Set(folderIds.map(String))
  let frontier = [...seen]

  while (frontier.length > 0) {
    const children = await DocumentItem.find({
      user: userId,
      parent: { $in: frontier },
      kind: 'folder',
    }).select('_id')

    frontier = []
    children.forEach((child) => {
      const id = child._id.toString()
      if (!seen.has(id)) {
        seen.add(id)
        frontier.push(id)
      }
    })
  }

  return seen
}

const getRecursiveDeleteIds = async (rootId, userId) => {
  const ids = [rootId.toString()]
  let frontier = [rootId.toString()]

  while (frontier.length > 0) {
    const children = await DocumentItem.find({
      user: userId,
      parent: { $in: frontier },
    }).select('_id')

    frontier = children.map((child) => child._id.toString())
    ids.push(...frontier)
  }

  return ids
}

const getUserVaultUsage = async (userId) => {
  const [result] = await DocumentItem.aggregate([
    { $match: { user: userId, kind: 'file' } },
    { $group: { _id: null, total: { $sum: '$size' } } },
  ])

  return result?.total ?? 0
}

export const listDocuments = async (req, res) => {
  try {
    const parentId = normalizeParentId(req.query.parentId)
    const currentFolder = await loadFolder(parentId, req.user._id)
    const [items, breadcrumbs, usedBytes] = await Promise.all([
      DocumentItem.find({ user: req.user._id, parent: parentId })
        .select('-content')
        .sort({ kind: -1, name: 1, updatedAt: -1 }),
      buildBreadcrumbs(currentFolder, req.user._id),
      getUserVaultUsage(req.user._id),
    ])

    res.json({
      parentId,
      breadcrumbs,
      items: items.map(serializeItem),
      storage: {
        usedBytes,
        limitBytes: MAX_VAULT_BYTES,
      },
    })
  } catch (error) {
    res.status(400).json({ message: 'Failed to load documents', error: error.message })
  }
}

export const listDocumentFolders = async (req, res) => {
  try {
    const folders = await DocumentItem.find({ user: req.user._id, kind: 'folder' })
      .select('_id name parent')
      .sort({ name: 1 })

    res.json(buildFolderPathMap(folders))
  } catch (error) {
    res.status(500).json({ message: 'Failed to load folders', error: error.message })
  }
}

export const createFolder = async (req, res) => {
  try {
    const parentId = normalizeParentId(req.body.parentId)
    await loadFolder(parentId, req.user._id)

    const folder = await DocumentItem.create({
      user: req.user._id,
      parent: parentId,
      kind: 'folder',
      name: sanitizeName(req.body.name, 'New folder'),
    })

    res.status(201).json(serializeItem(folder))
  } catch (error) {
    res.status(400).json({ message: 'Failed to create folder', error: error.message })
  }
}

export const uploadDocuments = async (req, res) => {
  try {
    const parentId = normalizeParentId(req.body.parentId)
    await loadFolder(parentId, req.user._id)

    const files = Array.isArray(req.files) ? req.files : []
    if (files.length === 0) {
      return res.status(400).json({ message: 'Select at least one file to upload' })
    }

    const incomingBytes = files.reduce((total, file) => total + (file.size ?? file.buffer?.length ?? 0), 0)
    const usedBytes = await getUserVaultUsage(req.user._id)
    if (usedBytes + incomingBytes > MAX_VAULT_BYTES) {
      const availableBytes = Math.max(0, MAX_VAULT_BYTES - usedBytes)
      return res.status(400).json({
        message: `Vault limit reached. You can store up to 50 MB total. ${availableBytes} bytes remaining.`,
      })
    }

    const created = await DocumentItem.insertMany(
      files.map((file) => ({
        user: req.user._id,
        parent: parentId,
        kind: 'file',
        name: sanitizeName(file.originalname, 'Untitled upload'),
        mimeType: file.mimetype || 'application/octet-stream',
        size: file.size ?? file.buffer?.length ?? 0,
        isImage: Boolean(file.mimetype?.startsWith('image/')),
        content: file.buffer,
      })),
    )

    res.status(201).json({
      items: created.map(serializeItem),
      message: `Uploaded ${created.length} file${created.length === 1 ? '' : 's'}.`,
      storage: {
        usedBytes: usedBytes + incomingBytes,
        limitBytes: MAX_VAULT_BYTES,
      },
    })
  } catch (error) {
    res.status(400).json({ message: 'Failed to upload documents', error: error.message })
  }
}

export const renameDocument = async (req, res) => {
  try {
    const updated = await DocumentItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name: sanitizeName(req.body.name) },
      { new: true, runValidators: true, select: '-content' },
    )

    if (!updated) {
      return res.status(404).json({ message: 'Document not found' })
    }

    res.json(serializeItem(updated))
  } catch (error) {
    res.status(400).json({ message: 'Failed to rename item', error: error.message })
  }
}

export const moveDocuments = async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids)
      ? req.body.ids.filter(Boolean)
      : req.body.id
        ? [req.body.id]
        : []
    if (ids.length === 0) {
      return res.status(400).json({ message: 'Select at least one item to move' })
    }

    const validIds = ids.filter((id) => ObjectId.isValid(id))
    if (validIds.length !== ids.length) {
      return res.status(400).json({ message: 'One or more selected ids are invalid' })
    }

    const targetParentId = normalizeParentId(req.body.targetParentId ?? req.body.targetFolderId)
    await loadFolder(targetParentId, req.user._id)

    const documents = await DocumentItem.find({
      _id: { $in: validIds },
      user: req.user._id,
    }).select('_id kind parent')

    if (documents.length !== validIds.length) {
      return res.status(404).json({ message: 'One or more selected items no longer exist' })
    }

    const folderIds = documents.filter((item) => item.kind === 'folder').map((item) => item._id.toString())
    if (targetParentId && folderIds.length > 0) {
      const forbiddenIds = await getFolderDescendantIds(folderIds, req.user._id)
      if (forbiddenIds.has(String(targetParentId))) {
        return res.status(400).json({ message: 'Cannot move a folder into itself or its child folder' })
      }
    }

    await DocumentItem.updateMany(
      { _id: { $in: validIds }, user: req.user._id },
      { $set: { parent: targetParentId } },
    )

    res.json({ moved: validIds.length })
  } catch (error) {
    res.status(400).json({ message: 'Failed to move documents', error: error.message })
  }
}

export const deleteDocument = async (req, res) => {
  try {
    const item = await DocumentItem.findOne({ _id: req.params.id, user: req.user._id }).select('_id kind')
    if (!item) {
      return res.status(404).json({ message: 'Document not found' })
    }

    const idsToDelete =
      item.kind === 'folder'
        ? await getRecursiveDeleteIds(item._id, req.user._id)
        : [item._id.toString()]

    await DocumentItem.deleteMany({ _id: { $in: idsToDelete }, user: req.user._id })
    res.status(204).end()
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete document', error: error.message })
  }
}

export const streamDocumentContent = async (req, res) => {
  try {
    const item = await DocumentItem.findOne({
      _id: req.params.id,
      user: req.user._id,
      kind: 'file',
    }).select('name mimeType content size')

    if (!item) {
      return res.status(404).json({ message: 'File not found' })
    }

    res.setHeader('Content-Type', item.mimeType || 'application/octet-stream')
    res.setHeader('Content-Length', item.size ?? item.content?.length ?? 0)
    res.setHeader('Content-Disposition', `inline; filename="${item.name.replace(/"/g, '')}"`)
    res.send(item.content)
  } catch (error) {
    res.status(400).json({ message: 'Failed to load file', error: error.message })
  }
}
