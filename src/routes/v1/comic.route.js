import express from 'express'
import { ComicController } from '../../controllers/comic.controller'
import { ComicValidation } from '../../validations/comic.validation'

const router = express.Router()

router.route('/')
    // .get((req, res) => console.log('GET comics'))
    .post(ComicValidation.createNew, ComicController.createNew)

export const comicRoutes = router