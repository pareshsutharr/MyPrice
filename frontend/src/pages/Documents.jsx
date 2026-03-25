import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Download, File, FileImage, FileText, Folder, FolderOpen, FolderPlus, Pencil, RefreshCw, Trash2, UploadCloud, X } from 'lucide-react'
import EmptyState from '@components/EmptyState.jsx'
import { api } from '@services/api.js'
import './Documents.css'

const formatFileSize = (size) => {
  if (!size) return '0 KB'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const getFileLabel = (item) => {
  if (item.kind === 'folder') return 'Folder'
  if (item.mimeType?.startsWith('image/')) return 'Image'
  if (item.mimeType === 'application/pdf') return 'PDF'
  if (item.mimeType?.includes('csv') || item.name?.toLowerCase().endsWith('.csv')) return 'CSV'
  return item.mimeType || 'File'
}

const sortDocumentItems = (list) =>
  [...list].sort((left, right) => {
    if (left.kind !== right.kind) {
      return left.kind === 'folder' ? -1 : 1
    }
    return left.name.localeCompare(right.name)
  })

const getUploadErrorMessage = (error) => {
  const statusCode = error?.response?.status
  const serverMessage = error?.response?.data?.message

  if (statusCode === 400 && serverMessage) return serverMessage
  if (statusCode === 401) return 'Your session expired. Please sign in again and retry the upload.'
  if (statusCode === 413) return 'The selected file is too large for the vault.'
  if (error?.code === 'ECONNABORTED') return 'Upload took too long. Check your connection and try again.'
  if (error?.message === 'Network Error') return 'Cannot reach the server. Make sure the backend is running.'
  return serverMessage || 'Upload failed. Please try again.'
}

const parseCsvText = (text = '') =>
  text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(',').map((cell) => cell.trim()))
    .filter((row) => row.length > 0 && row.some(Boolean))

const Documents = () => {
  const [items, setItems] = useState([])
  const [breadcrumbs, setBreadcrumbs] = useState([])
  const [currentParentId, setCurrentParentId] = useState(null)
  const [activeItemId, setActiveItemId] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState({ active: false, percent: 0, loaded: 0, total: 0, count: 0 })
  const [dragActive, setDragActive] = useState(false)
  const [draggedItemId, setDraggedItemId] = useState(null)
  const [storage, setStorage] = useState({ usedBytes: 0, limitBytes: 50 * 1024 * 1024 })
  const [dialog, setDialog] = useState({ type: '', item: null })
  const [dialogValue, setDialogValue] = useState('')
  const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0, item: null })
  const [inlineRename, setInlineRename] = useState({ id: null, value: '' })
  const [preview, setPreview] = useState({
    open: false,
    item: null,
    url: '',
    mimeType: '',
    loading: false,
    error: '',
    csvRows: [],
  })
  const fileInputRef = useRef(null)

  const activeItem = items.find((item) => item.id === activeItemId) ?? null
  const selectedItems = items.filter((item) => selectedIds.includes(item.id))

  const loadDocuments = async (parentId = null) => {
    setLoading(true)
    setError('')

    try {
      const response = await api.getDocuments(parentId)
      setItems(sortDocumentItems(response.items))
      setBreadcrumbs(response.breadcrumbs)
      setCurrentParentId(response.parentId)
      setActiveItemId(null)
      setSelectedIds([])
      setLastSelectedIndex(null)
      setStorage(response.storage ?? { usedBytes: 0, limitBytes: 50 * 1024 * 1024 })
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? 'Unable to load documents')
    } finally {
      setLoading(false)
    }
  }

  const refresh = async (parentId = currentParentId) => {
    await loadDocuments(parentId)
  }

  useEffect(() => {
    refresh(null)
  }, [])

  useEffect(() => {
    const handlePaste = async (event) => {
      const clipboardFiles = Array.from(event.clipboardData?.items ?? [])
        .filter((item) => item.type?.startsWith('image/'))
        .map((item) => item.getAsFile())
        .filter(Boolean)

      if (clipboardFiles.length === 0) return

      event.preventDefault()
      const stampedFiles = clipboardFiles.map((file, index) => {
        const extension = file.type.split('/')[1] || 'png'
        return new File([file], `pasted-image-${Date.now()}-${index + 1}.${extension}`, {
          type: file.type,
        })
      })

      await handleUpload(stampedFiles, 'Pasted image saved to your vault.')
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [currentParentId])

  useEffect(() => {
    const closeMenu = () => setContextMenu((previous) => ({ ...previous, open: false }))
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeMenu()
        setInlineRename({ id: null, value: '' })
      }
    }

    window.addEventListener('click', closeMenu)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('click', closeMenu)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    if (!preview.open || !preview.item || preview.item.kind !== 'file') {
      setPreview((previous) => {
        if (previous.url) URL.revokeObjectURL(previous.url)
        return {
          open: previous.open,
          item: previous.item,
          url: '',
          mimeType: '',
          loading: false,
          error: '',
          csvRows: [],
        }
      })
      return undefined
    }

    let cancelled = false
    let objectUrl = ''

    const loadPreview = async () => {
      setPreview((previous) => ({
        ...previous,
        url: '',
        mimeType: preview.item.mimeType || '',
        loading: true,
        error: '',
        csvRows: [],
      }))

      try {
        const blob = await api.getDocumentBlob(preview.item.id)
        if (cancelled) return
        if (blob.type.includes('csv') || preview.item.name.toLowerCase().endsWith('.csv')) {
          const text = await blob.text()
          setPreview((previous) => ({
            ...previous,
            mimeType: blob.type || 'text/csv',
            loading: false,
            error: '',
            csvRows: parseCsvText(text),
          }))
          return
        }

        objectUrl = URL.createObjectURL(blob)
        setPreview((previous) => ({
          ...previous,
          url: objectUrl,
          mimeType: blob.type || preview.item.mimeType || '',
          loading: false,
          error: '',
          csvRows: [],
        }))
      } catch (requestError) {
        if (cancelled) return
        setPreview((previous) => ({
          ...previous,
          url: '',
          mimeType: preview.item.mimeType || '',
          loading: false,
          error: requestError?.response?.data?.message ?? 'Unable to preview file',
          csvRows: [],
        }))
      }
    }

    loadPreview()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [preview.open, preview.item])

  const handleUpload = async (files, successMessage = '') => {
    if (!files.length) return

    setBusy(true)
    setError('')
    setStatus(`Uploading ${files.length} file${files.length === 1 ? '' : 's'}...`)
    setUploadProgress({ active: true, percent: 0, loaded: 0, total: files.reduce((sum, file) => sum + (file.size || 0), 0), count: files.length })

    try {
      const response = await api.uploadDocuments({
        parentId: currentParentId,
        files,
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total ?? files.reduce((sum, file) => sum + (file.size || 0), 0)
          const loaded = progressEvent.loaded ?? 0
          const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0
          setUploadProgress({
            active: true,
            percent,
            loaded,
            total,
            count: files.length,
          })
          setStatus(`Uploading ${files.length} file${files.length === 1 ? '' : 's'}... ${percent}%`)
        },
      })
      setUploadProgress((previous) => ({ ...previous, active: true, percent: 100 }))
      setStatus(successMessage || response.message)
      if (response.storage) setStorage(response.storage)
      if (Array.isArray(response.items) && response.items.length > 0) {
        setItems((previous) => {
          const existingIds = new Set(previous.map((item) => item.id))
          const merged = [...previous, ...response.items.filter((item) => !existingIds.has(item.id))]
          return sortDocumentItems(merged)
        })
      }
      refresh(currentParentId).catch(() => {})
    } catch (requestError) {
      setError(getUploadErrorMessage(requestError))
      setStatus('')
    } finally {
      setTimeout(() => {
        setUploadProgress({ active: false, percent: 0, loaded: 0, total: 0, count: 0 })
      }, 500)
      setBusy(false)
    }
  }

  const openDialog = (type, item = null) => {
    setDialog({ type, item })
    setDialogValue(type === 'rename' ? item?.name ?? '' : '')
    setContextMenu((previous) => ({ ...previous, open: false }))
  }

  const closeDialog = () => {
    setDialog({ type: '', item: null })
    setDialogValue('')
  }

  const closePreview = () => {
    setPreview((previous) => {
      if (previous.url) URL.revokeObjectURL(previous.url)
      return { open: false, item: null, url: '', mimeType: '', loading: false, error: '', csvRows: [] }
    })
  }

  const submitDialog = async (event) => {
    event.preventDefault()
    const name = dialogValue.trim()
    if (!name) {
      setError('Name is required.')
      return
    }

    setBusy(true)
    setError('')
    setStatus('')

    try {
      if (dialog.type === 'folder') {
        await api.createDocumentFolder({ name, parentId: currentParentId })
        setStatus('Folder created.')
      }

      if (dialog.type === 'rename' && dialog.item) {
        await api.renameDocument(dialog.item.id, { name })
        setStatus('Item renamed.')
      }

      closeDialog()
      await refresh(currentParentId)
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? 'Unable to save changes')
    } finally {
      setBusy(false)
    }
  }

  const saveInlineRename = async () => {
    if (!inlineRename.id) return
    const nextName = inlineRename.value.trim()
    const target = items.find((item) => item.id === inlineRename.id)
    if (!target || !nextName || nextName === target.name) {
      setInlineRename({ id: null, value: '' })
      return
    }

    setBusy(true)
    try {
      await api.renameDocument(inlineRename.id, { name: nextName })
      setItems((previous) =>
        previous.map((item) => (item.id === inlineRename.id ? { ...item, name: nextName } : item)),
      )
      setStatus('Item renamed.')
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? 'Unable to rename item')
    } finally {
      setInlineRename({ id: null, value: '' })
      setBusy(false)
    }
  }

  const handleDeleteItems = async (itemsToDelete) => {
    if (!itemsToDelete.length) return
    const confirmed = window.confirm(
      `Delete ${itemsToDelete.length} item${itemsToDelete.length === 1 ? '' : 's'}? Folders delete all nested files too.`,
    )
    if (!confirmed) return

    setBusy(true)
    setError('')
    setStatus('')
    setContextMenu((previous) => ({ ...previous, open: false }))

    try {
      await Promise.all(itemsToDelete.map((item) => api.deleteDocument(item.id)))
      setItems((previous) => previous.filter((item) => !itemsToDelete.some((target) => target.id === item.id)))
      setSelectedIds([])
      setStatus('Selected items deleted.')
      if (preview.item && itemsToDelete.some((item) => item.id === preview.item.id)) {
        closePreview()
      }
      refresh(currentParentId).catch(() => {})
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? 'Unable to delete item')
    } finally {
      setBusy(false)
    }
  }

  const openFolder = (folderId) => {
    loadDocuments(folderId)
  }

  const handleOpenItem = (item) => {
    setActiveItemId(item.id)
    if (item.kind === 'folder') {
      openFolder(item.id)
      return
    }
    setPreview({
      open: true,
      item,
      url: '',
      mimeType: item.mimeType || '',
      loading: true,
      error: '',
      csvRows: [],
    })
  }

  const handleDownload = async (item = activeItem) => {
    if (!item || item.kind !== 'file') return

    setBusy(true)
    setError('')
    setContextMenu((previous) => ({ ...previous, open: false }))

    try {
      const blob = await api.getDocumentBlob(item.id)
      const url = preview.item?.id === item.id && preview.url ? preview.url : URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = item.name
      anchor.click()
      if (!(preview.item?.id === item.id && preview.url)) {
        URL.revokeObjectURL(url)
      }
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? 'Unable to download file')
    } finally {
      setBusy(false)
    }
  }

  const moveItems = async (ids, targetFolderId) => {
    if (!ids.length || !targetFolderId) return
    setBusy(true)
    setError('')

    try {
      await api.moveDocuments({ ids, targetParentId: targetFolderId })
      setItems((previous) => previous.filter((item) => !ids.includes(item.id)))
      setSelectedIds((previous) => previous.filter((id) => !ids.includes(id)))
      setStatus('Items moved.')
      refresh(currentParentId).catch(() => {})
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? 'Unable to move items')
    } finally {
      setBusy(false)
    }
  }

  const toggleSelect = (itemId, index, checked, event) => {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      if (event?.shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index)
        const end = Math.max(lastSelectedIndex, index)
        const rangeIds = items.slice(start, end + 1).map((item) => item.id)
        rangeIds.forEach((id) => {
          if (checked) next.add(id)
          else next.delete(id)
        })
      } else if (checked) {
        next.add(itemId)
      } else {
        next.delete(itemId)
      }
      return Array.from(next)
    })
    setLastSelectedIndex(index)
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([])
      return
    }
    setSelectedIds(items.map((item) => item.id))
  }

  const openContextMenu = (event, item = null) => {
    event.preventDefault()
    event.stopPropagation()
    if (item) {
      setActiveItemId(item.id)
    }
    const menuWidth = 208
    const menuHeight = item ? 148 : 136
    setContextMenu({
      open: true,
      x: clamp(event.clientX, 8, window.innerWidth - menuWidth - 8),
      y: clamp(event.clientY, 8, window.innerHeight - menuHeight - 8),
      item,
    })
  }

  const handleContextAction = (action, item = null) => {
    if (action === 'upload') {
      setContextMenu((previous) => ({ ...previous, open: false }))
      fileInputRef.current?.click()
      return
    }

    if (action === 'folder') {
      openDialog('folder')
      return
    }

    if (action === 'refresh') {
      setContextMenu((previous) => ({ ...previous, open: false }))
      refresh(currentParentId)
      return
    }

    if (action === 'open' && item) {
      setContextMenu((previous) => ({ ...previous, open: false }))
      handleOpenItem(item)
      return
    }

    if (action === 'rename' && item) {
      setInlineRename({ id: item.id, value: item.name })
      setContextMenu((previous) => ({ ...previous, open: false }))
      return
    }

    if (action === 'download' && item) {
      handleDownload(item)
      return
    }

    if (action === 'delete' && item) {
      handleDeleteItems([item])
    }
  }

  const contextActions = contextMenu.item
    ? [
        {
          action: 'open',
          label: contextMenu.item.kind === 'folder' ? 'Open folder' : 'Preview file',
          icon: contextMenu.item.kind === 'folder' ? Folder : FileText,
        },
        {
          action: 'rename',
          label: 'Rename',
          icon: Pencil,
        },
        {
          action: 'delete',
          label: 'Delete',
          icon: Trash2,
          danger: true,
        },
      ]
    : [
        {
          action: 'upload',
          label: 'Upload files',
          icon: UploadCloud,
        },
        {
          action: 'folder',
          label: 'New folder',
          icon: FolderPlus,
        },
        {
          action: 'refresh',
          label: 'Refresh',
          icon: RefreshCw,
        },
      ]

  const currentPathLabel = breadcrumbs.length
    ? ['Vault root', ...breadcrumbs.map((crumb) => crumb.name)].join(' / ')
    : 'Vault root'
  const projectedStorageBytes = uploadProgress.active
    ? Math.min(storage.limitBytes, storage.usedBytes + uploadProgress.loaded)
    : storage.usedBytes
  const storagePercent = storage.limitBytes > 0 ? Math.min(100, (projectedStorageBytes / storage.limitBytes) * 100) : 0

  return (
    <div
      className={`documents-page ${dragActive ? 'documents-page--dragging' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return
        setDragActive(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragActive(false)
        handleUpload(Array.from(event.dataTransfer.files ?? []))
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept="application/pdf,image/*,.csv"
        multiple
        onChange={(event) => {
          handleUpload(Array.from(event.target.files ?? []))
          event.target.value = ''
        }}
      />

      <section className="glass-card documents-browser" onContextMenu={(event) => openContextMenu(event)}>
        <div className="documents-browser__topbar">
          <div className="documents-browser__meta">
            <div className="documents-path">
              <button type="button" onClick={() => loadDocuments(null)}>Vault root</button>
              {breadcrumbs.map((crumb) => (
                <button key={crumb.id} type="button" onClick={() => loadDocuments(crumb.id)}>
                  / {crumb.name}
                </button>
              ))}
            </div>
            <div className="documents-storage">
              <div className="documents-storage__labels">
                <span>Vault storage</span>
                <span>{formatFileSize(projectedStorageBytes)} / {formatFileSize(storage.limitBytes)}</span>
              </div>
              <div className="documents-storage__bar">
                <span style={{ width: `${storagePercent}%` }} />
              </div>
            </div>
            {uploadProgress.active && (
              <div className="documents-upload-progress">
                <div className="documents-upload-progress__labels">
                  <span>Uploading {uploadProgress.count} file{uploadProgress.count === 1 ? '' : 's'}</span>
                  <div className="documents-upload-progress__actions">
                    <span>{uploadProgress.percent}%</span>
                    <button type="button" className="documents-upload-progress__refresh" onClick={() => refresh(currentParentId)} disabled={busy}>
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="documents-upload-progress__bar">
                  <span style={{ width: `${uploadProgress.percent}%` }} />
                </div>
                <div className="documents-upload-progress__meta">
                  {formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total || 0)} uploaded · storage {formatFileSize(projectedStorageBytes)} / {formatFileSize(storage.limitBytes)}
                </div>
              </div>
            )}
          </div>

          {(busy || status || error) && (
            <div className="documents-live-status">
              {error ? <span className="documents-live-status documents-live-status--error">{error}</span> : null}
              {!error && status ? <span className="documents-live-status documents-live-status--ok">{status}</span> : null}
            </div>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="documents-bulkbar">
            <span>{selectedIds.length} selected</span>
            <div className="documents-bulkbar__actions">
              <button type="button" className="btn-secondary" onClick={() => handleDeleteItems(selectedItems)} disabled={busy}>
                <Trash2 className="h-4 w-4" />
                Delete selected
              </button>
              <button type="button" className="btn-secondary" onClick={() => setSelectedIds([])} disabled={busy}>
                Clear
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="documents-empty" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Your vault is empty"
            subtitle="Upload a PDF, screenshot, or image to start building this folder."
            actionLabel="Upload File"
            onAction={() => fileInputRef.current?.click()}
          />
        ) : (
          <div className="documents-table">
            <div className="documents-table__head">
              <label className="documents-table__checkall">
                <input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === items.length} onChange={toggleSelectAll} />
              </label>
              <span>Name</span>
              <span>Type</span>
              <span>Size</span>
              <span>Updated</span>
            </div>
            {items.map((item, index) => {
              const isSelected = selectedIds.includes(item.id)
              const isFolderDropTarget = item.kind === 'folder' && draggedItemId && draggedItemId !== item.id
              return (
                <div
                  key={item.id}
                  className={`documents-row ${activeItemId === item.id ? 'documents-row--selected' : ''} ${isFolderDropTarget ? 'documents-row--drop-target' : ''}`}
                  onClick={() => setActiveItemId(item.id)}
                  onContextMenu={(event) => openContextMenu(event, item)}
                  draggable={inlineRename.id !== item.id}
                  onDragStart={() => setDraggedItemId(item.id)}
                  onDragEnd={() => setDraggedItemId(null)}
                  onDragOver={(event) => {
                    if (item.kind !== 'folder' || draggedItemId === item.id) return
                    event.preventDefault()
                  }}
                  onDrop={(event) => {
                    if (item.kind !== 'folder' || !draggedItemId || draggedItemId === item.id) return
                    event.preventDefault()
                    setDraggedItemId(null)
                    moveItems([draggedItemId], item.id)
                  }}
                >
                  <label className="documents-row__checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(event) => toggleSelect(item.id, index, event.target.checked, event.nativeEvent)}
                    />
                  </label>

                  {inlineRename.id === item.id ? (
                    <div className="documents-row__rename">
                      <input
                        className="documents-input"
                        value={inlineRename.value}
                        onChange={(event) => setInlineRename({ id: item.id, value: event.target.value })}
                        onBlur={saveInlineRename}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') saveInlineRename()
                          if (event.key === 'Escape') setInlineRename({ id: null, value: '' })
                        }}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="documents-row__name"
                      onClick={() => handleOpenItem(item)}
                      onDoubleClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setInlineRename({ id: item.id, value: item.name })
                      }}
                    >
                      <span className="documents-row__icon">
                        {item.kind === 'folder' ? (
                          <Folder className="h-4 w-4" />
                        ) : item.isImage ? (
                          <FileImage className="h-4 w-4" />
                        ) : item.mimeType === 'application/pdf' ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <File className="h-4 w-4" />
                        )}
                      </span>
                      <span>{item.name}</span>
                    </button>
                  )}

                  <span>{getFileLabel(item)}</span>
                  <span>{item.kind === 'folder' ? '--' : formatFileSize(item.size)}</span>
                  <span>{new Date(item.updatedAt).toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {contextMenu.open &&
        createPortal(
          <div className="documents-context-menu" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(event) => event.stopPropagation()}>
            {contextActions.map(({ action, label, icon: Icon, danger }) => (
              <button
                key={action}
                type="button"
                className={`documents-context-menu__item ${danger ? 'documents-context-menu__item--danger' : ''}`}
                onClick={() => handleContextAction(action, contextMenu.item)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>,
          document.body,
        )}

      {preview.open && preview.item && (
        <div className="documents-preview" onClick={closePreview}>
          <div className="documents-preview__card" onClick={(event) => event.stopPropagation()}>
            <div className="documents-preview__header">
              <div>
                <p className="documents-preview__eyebrow">Path</p>
                <h3 className="documents-preview__title">{currentPathLabel}</h3>
                <p className="documents-preview__meta">
                  {preview.item.name} · {getFileLabel(preview.item)}{preview.item.kind === 'file' ? ` · ${formatFileSize(preview.item.size)}` : ''}
                </p>
              </div>
              <button type="button" className="documents-preview__close" onClick={closePreview}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="documents-preview__toolbar">
              <button type="button" className="btn-secondary" onClick={() => setInlineRename({ id: preview.item.id, value: preview.item.name })} disabled={busy}>
                <Pencil className="h-4 w-4" />
                Rename
              </button>
              <button type="button" className="btn-secondary" onClick={() => handleDownload(preview.item)} disabled={busy}>
                <Download className="h-4 w-4" />
                Download
              </button>
              <button type="button" className="btn-secondary documents-preview__danger" onClick={() => handleDeleteItems([preview.item])} disabled={busy}>
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>

            <div className="documents-preview__body">
              {preview.loading ? (
                <div className="documents-preview__empty">Loading preview...</div>
              ) : preview.error ? (
                <div className="documents-preview__empty">{preview.error}</div>
              ) : preview.csvRows.length > 0 ? (
                <div className="documents-preview__table-wrap">
                  <table className="documents-preview__table">
                    <tbody>
                      {preview.csvRows.map((row, rowIndex) => (
                        <tr key={`${preview.item.id}-row-${rowIndex}`}>
                          {row.map((cell, cellIndex) => (
                            <td key={`${preview.item.id}-cell-${rowIndex}-${cellIndex}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : preview.mimeType.startsWith('image/') ? (
                <img src={preview.url} alt={preview.item.name} className="documents-preview__image" />
              ) : preview.mimeType === 'application/pdf' ? (
                <embed src={preview.url} type="application/pdf" className="documents-preview__frame" />
              ) : (
                <div className="documents-preview__empty">Download to view this file type.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {dialog.type && (
        <div className="documents-dialog">
          <form className="documents-dialog__card" onSubmit={submitDialog}>
            <div>
              <p className="text-sm text-slate-500">
                {dialog.type === 'folder' ? 'Create folder' : 'Rename item'}
              </p>
              <h3 className="text-xl font-display text-slate-900">
                {dialog.type === 'folder' ? 'New folder' : dialog.item?.name}
              </h3>
            </div>
            <input
              className="documents-input"
              value={dialogValue}
              onChange={(event) => setDialogValue(event.target.value)}
              placeholder={dialog.type === 'folder' ? 'Folder name' : 'New item name'}
              autoFocus
            />
            <div className="documents-dialog__actions">
              <button type="button" className="btn-secondary" onClick={closeDialog} disabled={busy}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={busy}>
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Documents
