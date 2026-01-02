import { Router } from 'express'
import { createIncome, deleteIncome, getIncome, updateIncome } from '../controllers/incomeController.js'

const router = Router()

router.route('/').get(getIncome).post(createIncome)
router.route('/:id').put(updateIncome).delete(deleteIncome)

export default router
