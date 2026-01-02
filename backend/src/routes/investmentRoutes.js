import { Router } from 'express'
import {
  createInvestment,
  deleteInvestment,
  getInvestments,
  importInvestmentStatement,
  importInvestmentStatementFile,
  updateInvestment,
} from '../controllers/investmentController.js'
import { upload } from '../middleware/upload.js'

const router = Router()

router.route('/').get(getInvestments).post(createInvestment)
router.route('/import/statement').post(importInvestmentStatement)
router.route('/import/upload').post(upload.single('statement'), importInvestmentStatementFile)
router.route('/:id').put(updateInvestment).delete(deleteInvestment)

export default router
