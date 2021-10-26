import express from 'express'
import { UserController } from '../../controllers/user.controller'
import { AuthMiddleware } from '../../middlewares/auth.middleware'
import { UserValidation } from '../../validations/user.validation'

const router = express.Router()

router.route('/login')
    .post(UserValidation.login, UserController.login)
router.route('/refresh-token')
    .post(UserController.refreshToken)
router.route('/:id')
    .get(AuthMiddleware.isAuth, UserController.getFullUser)
export const userRoutes = router