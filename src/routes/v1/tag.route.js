import express from 'express'
import { TagController } from '../../controllers/tag.controller'
import { TagValidation } from '../../validations/tag.validation'

const router = express.Router()

router.route('/')
    .post(TagValidation.createNew, TagController.createNew)

router.route('/:id')
    .put(TagValidation.update, TagController.update)

export const tagRoutes = router