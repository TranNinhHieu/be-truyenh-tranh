import { ComicModel } from '../models/comic.model'
import { getDB } from '../config/mongodb'

const comicCollectionName = 'comics'

const createNew = async (data) => {
    try {
        const number = await getDB().collection(comicCollectionName).count()
        data.number = number + 1
        const result = await ComicModel.createNew(data)
        return result
    } catch (error) {
        throw new Error(error)
    }
}

export const ComicService = { createNew }