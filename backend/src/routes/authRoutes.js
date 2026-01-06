import { Router } from 'express'
import { googleLogin, devLogin } from '../controllers/authController.js'

const router = Router()

router.post('/google', googleLogin)
router.post('/dev-login', devLogin)

export default router
