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

const update = async (id, data) => {
    try {
        const updataData = {
            ...data,
            updateAt: Date.now()
        }
        const result = await ComicModel.update(id, updataData)
        return result
    } catch (error) {
        throw new Error(error)
    }
}

const getComic = async (page) => {
    try {
        const result = await ComicModel.getComic(page)
        return result
    } catch (error) {
        throw new Error(error)
    }
}

const getDetailComic = async (id) => {
    try {
        const result = await ComicModel.getDetailComic(id)
        return result
    } catch (error) {
        throw new Error(error)
    }
}

const getAllComicOfTag = async (tagID) => {
    try {
        const result = await ComicModel.getAllComicOfTag(tagID)
        return result
    } catch (error) {
        throw new Error(error)
    }
}

export const ComicService = {
    createNew,
    update,
    getComic,
    getDetailComic,
    getAllComicOfTag
}