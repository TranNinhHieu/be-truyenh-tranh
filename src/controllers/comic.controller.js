import { ComicService } from '../services/comic.service'
import { HttpStatusCode } from '../utilities/constants'

const createNew = async (req, res) => {
    try {
        const result = await ComicService.createNew(req.body)

        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params
        const result = await ComicService.update(id, req.body)

        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const getComic = async (req, res) => {
    try {
        const { page } = req.params
        const result = await ComicService.getComic(page)

        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const getDetailComic = async (req, res) => {
    try {
        const { id } = req.params
        const result = await ComicService.getDetailComic(id)

        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const getAllComicOfTag = async (req, res) => {
    try {
        const { tagID, page } = req.query
        const result = await ComicService.getAllComicOfTag(tagID, page)

        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const getQuantityPage = async (req, res) => {
    try {

        const { tagID } = req.query
        const result = await ComicService.getQuantityPage(tagID)

        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

export const ComicController = {
    createNew,
    update,
    getComic,
    getDetailComic,
    getAllComicOfTag,
    getQuantityPage
}