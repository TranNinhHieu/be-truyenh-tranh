import express from 'express'
import { HttpStatusCode } from '../../utilities/constants'
import { chapterRoutes } from './chapter.route'
import { comicRoutes } from './comic.route'
import { tagRoutes } from './tag.route'

const router = express.Router()

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.status(HttpStatusCode.OK).json({
    status: 'OK!'
}))

/* Comics APIs*/
router.use('/comics', comicRoutes)
router.use('/chapters', chapterRoutes)
router.use('/tags', tagRoutes)

export const apiV1 = router