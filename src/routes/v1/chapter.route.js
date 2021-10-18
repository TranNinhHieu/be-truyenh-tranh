import express from 'express'
import { ChapterController } from '../../controllers/chapter.controller'
import { ChapterValidation } from '../../validations/chapter.validation'

const router = express.Router()

router.route('/')
    .post(ChapterValidation.createNew, ChapterController.createNew)

router.route('/:id')
    .put(ChapterValidation.update, ChapterController.update)

export const chapterRoutes = router