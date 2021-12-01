import express from 'express'
import { NotificationController } from '../../controllers/notification.controller'
import { AuthMiddleware } from '../../middlewares/auth.middleware'

const router = express.Router()

router.route('/:userID')
    .put(AuthMiddleware.isAuth, NotificationController.updateStatus)
router.route('/:id')
    .delete(AuthMiddleware.isAuth, NotificationController.remove)
router.route('/')
    .get(AuthMiddleware.isAuth, NotificationController.getNotifications)

export const notificationRoutes = router