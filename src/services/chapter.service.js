import { ChapterModel } from '../models/chapter.model'
import { getDB } from '../config/mongodb'

const chapterCollectionName = 'chapters'

const createNew = async (data) => {
    try {
        let number = null
        if (data.chap*1 === 0) {
            number = await getDB().collection(chapterCollectionName).find({ comicID: data.comicID, _destroy: false }).count()
            data.chap = number + 1
        } else {
            data.chap = data.chap*1
        }
        const result = await ChapterModel.createNew(data)
        return result
    } catch (error) {
        throw new Error(error)
    }
}

const update = async (id, data) => {
    try {
        const updateData = {
            ...data,
            updateAt: Date.now()
        }
        const result = await ChapterModel.update(id, updateData)
        return result
    } catch (error) {
        throw new Error(error)
    }
}

const getAllChapterOfComic = async (comicID) => {
    try {
        const result = await ChapterModel.getAllChapterOfComic(comicID)
        return result
    } catch (error) {
        throw new Error(error)
    }
}

const getFullChapter = async (comicID, chap) => {
    try {
        const result = await ChapterModel.getFullChapter(comicID, chap)
        return result
    } catch (error) {
        throw new Error(error)
    }
}

const getQuantityChapter = async (comicID) => {
    try {
        const result = await ChapterModel.getQuantityChapter(comicID)
        return result
    } catch (error) {
        throw new Error(error)
    }
}

const getNewComics = async () => {
    try {
        const result = await ChapterModel.getNewComics()
        return result
    } catch (error) {
        throw new Error(error)
    }
}

export const ChapterService = {
    createNew,
    update,
    getAllChapterOfComic,
    getFullChapter,
    getQuantityChapter,
    getNewComics
}