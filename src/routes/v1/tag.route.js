import express from 'express'
import { TagController } from '../../controllers/tag.controller'
import { TagValidation } from '../../validations/tag.validation'

const router = express.Router()

router.route('/')
    .post(TagValidation.createNew, TagController.createNew)

router.route('/:id')
    .put(TagValidation.update, TagController.update)

router.route('/comic/:comicID')
    .get(TagController.getTagOfComic)
router.route('/')
    .get(TagController.getAllTag)
export const tagRoutes = router