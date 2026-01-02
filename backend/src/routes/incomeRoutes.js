import { Router } from 'express'
import { createIncome, getIncome } from '../controllers/incomeController.js'

const router = Router()

router.route('/').get(getIncome).post(createIncome)

export default router
