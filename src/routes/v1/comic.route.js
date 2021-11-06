import express from 'express'
import { ComicController } from '../../controllers/comic.controller'
import { CommentController } from '../../controllers/comment.controller'
import { ComicValidation } from '../../validations/comic.validation'

const router = express.Router()

router.route('/')
    .post(ComicValidation.createNew, ComicController.createNew)
router.route('/:id')
    .put(ComicValidation.update, ComicController.update)
router.route('/tag')
    .get(ComicController.getAllComicOfTag)
router.route('/number-follow-like/:id')
    .get(ComicController.getFollownLike)
router.route('/detail/:id')
    .get(ComicController.getDetailComic)
router.route('/quantity-page')
    .get(ComicController.getQuantityPage)
router.route('/comments')
    .get(CommentController.getComments)
router.route('/:page')
    .get(ComicController.getComic)

export const comicRoutes = router