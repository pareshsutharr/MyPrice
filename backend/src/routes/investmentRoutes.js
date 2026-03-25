import { Router } from 'express'
import multer from 'multer'
import {
  createInvestment,
  deleteInvestment,
  downloadInvestmentTemplate,
  getInvestments,
  importInvestmentsFromFile,
  importInvestmentStatement,
  importInvestmentStatementFile,
  updateInvestment,
} from '../controllers/investmentController.js'
import { upload } from '../middleware/upload.js'

const router = Router()
const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = new Set([
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ])
    if (!allowedTypes.has(file.mimetype)) {
      callback(new Error('Only CSV and XLSX files are supported.'))
      return
    }
    callback(null, true)
  },
})

router.route('/').get(getInvestments).post(createInvestment)
router.get('/import/template', downloadInvestmentTemplate)
router.post('/import', (req, res, next) => {
  importUpload.single('file')(req, res, (error) => {
    if (!error) return next()
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'Import file must be 10 MB or smaller.' })
    }
    return res.status(400).json({ success: false, error: error.message || 'Import upload failed.' })
  })
}, importInvestmentsFromFile)
router.route('/import/statement').post(importInvestmentStatement)
router.route('/import/upload').post(upload.single('statement'), importInvestmentStatementFile)
router.route('/:id').put(updateInvestment).delete(deleteInvestment)

export default router
