import express from 'express'
import { ChapterController } from '../../controllers/chapter.controller'
import { ChapterValidation } from '../../validations/chapter.validation'

const router = express.Router()

router.route('/')
    .post(ChapterValidation.createNew, ChapterController.createNew)

router.route('/:id')
    .put(ChapterValidation.update, ChapterController.update)

router.route('/comic/:comicID')
    .get(ChapterController.getAllChapterOfComic)
router.route('/')
    .get(ChapterController.getFullChapter)
router.route('/quantity/:comicID')
    .get(ChapterController.getQuantityChapter)
export const chapterRoutes = router