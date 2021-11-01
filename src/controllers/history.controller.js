import { HistoryService } from '../services/history.service'
import { HttpStatusCode } from '../utilities/constants'

const addHistory = async (req, res) => {
    try {
        const result = await HistoryService.addHistory(req.body)

        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }

}

const getHistory = async (req, res) => {
    try {
        const { userID, page } = req.query
        const result = await HistoryService.getHistory(userID, page)

        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }

}

const removeHistory = async (req, res) => {
    try {
        const { userID, comicID, chap } = req.query
        const result = await HistoryService.removeHistory(userID, comicID, chap)

        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }

}

const removeAllHistory = async (req, res) => {
    try {
        const { userID } = req.query
        const result = await HistoryService.removeAllHistory(userID)

        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }

}

export const HistoryController = {
    getHistory,
    addHistory,
    removeHistory,
    removeAllHistory
}