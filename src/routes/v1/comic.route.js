import express from 'express'
import { ComicController } from '../../controllers/comic.controller'
import { ComicValidation } from '../../validations/comic.validation'

const router = express.Router()

router.route('/')
    .post(ComicValidation.createNew, ComicController.createNew)

router.route('/:id')
    .put(ComicValidation.update, ComicController.update)

export const comicRoutes = router