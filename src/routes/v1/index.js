import express from 'express'
import { HttpStatusCode } from '../../utilities/constants'
import { comicRoutes } from './comic.route'

const router = express.Router()

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.status(HttpStatusCode.OK).json({
    status: 'OK!'
}))

/* Comics APIs*/
router.use('/comics', comicRoutes)

export const apiV1 = router