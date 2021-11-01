import express from 'express'
import { CommentController } from '../../controllers/comment.controller'
import { HistoryController } from '../../controllers/history.controller'
import { UserController } from '../../controllers/user.controller'
import { AuthMiddleware } from '../../middlewares/auth.middleware'
import { CommentValidation } from '../../validations/comment.validation'
import { UserValidation } from '../../validations/user.validation'

const router = express.Router()

router.route('/login')
    .post(UserValidation.login, UserController.login)
router.route('/google-login')
    .post(UserController.googleLogin)
router.route('/refresh-token')
    .post(UserController.refreshToken)
router.route('/logout')
    .get(UserController.logout)
router.route('/follow')
    .put(AuthMiddleware.isAuth, UserController.updateFollowComic)
    .get(AuthMiddleware.isAuth, UserController.followStatus)
router.route('/like')
    .put(AuthMiddleware.isAuth, UserController.updateLikeComic)
    .get(AuthMiddleware.isAuth, UserController.likeStatus)
router.route('/:userID')
    .put(AuthMiddleware.isAuth, UserController.update)
router.route('/remove-all-history')
    .delete(AuthMiddleware.isAuth, HistoryController.removeAllHistory)
router.route('/comment/:id')
    .put(AuthMiddleware.isAuth, CommentValidation.updateComment, CommentController.updateComment)
router.route('/comment')
    .delete(AuthMiddleware.isAuth, CommentController.removeComment)
    .post(AuthMiddleware.isAuth, CommentValidation.postComment, CommentController.postComment)
router.route('/remove-history')
    .delete(AuthMiddleware.isAuth, HistoryController.removeHistory)
router.route('/history')
    .post(AuthMiddleware.isAuth, HistoryController.addHistory)
    .get(AuthMiddleware.isAuth, HistoryController.getHistory)
router.route('/:id')
    .get(AuthMiddleware.isAuth, UserController.getFullUser)
export const userRoutes = router