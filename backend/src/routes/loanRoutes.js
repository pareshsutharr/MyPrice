import { Router } from 'express'
import {
  createLoan,
  getLoans,
  updateLoan,
  deleteLoan,
  payLoanEmi,
  undoLoanPayment,
} from '../controllers/loanController.js'

const router = Router()

router.route('/').get(getLoans).post(createLoan)
router.route('/:id').put(updateLoan).delete(deleteLoan)
router.route('/:id/pay').post(payLoanEmi)
router.route('/:id/pay/:paymentId').delete(undoLoanPayment)

export default router
