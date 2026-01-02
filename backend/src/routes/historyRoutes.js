import { Router } from 'express'
import { getHistory } from '../controllers/historyController.js'

const router = Router()

router.route('/').get(getHistory)

export default router
