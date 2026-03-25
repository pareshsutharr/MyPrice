import { Router } from 'express'
import multer from 'multer'
import {
  createFolder,
  deleteDocument,
  listDocumentFolders,
  listDocuments,
  moveDocuments,
  renameDocument,
  streamDocumentContent,
  uploadDocuments,
} from '../controllers/documentController.js'
import { upload } from '../middleware/upload.js'

const router = Router()

router.get('/', listDocuments)
router.get('/folders', listDocumentFolders)
router.post('/folders', createFolder)
router.post('/upload', (req, res, next) => {
  upload.array('files', 20)(req, res, (error) => {
    if (!error) return next()
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Vault uploads support files up to 50 MB.' })
      }
      return res.status(400).json({ message: error.message })
    }
    return res.status(400).json({ message: error.message || 'Failed to process upload.' })
  })
}, uploadDocuments)
router.post('/move', moveDocuments)
router.get('/:id/content', streamDocumentContent)
router.patch('/:id', renameDocument)
router.delete('/:id', deleteDocument)

export default router
