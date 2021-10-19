import { ChapterModel } from '../models/chapter.model'
import { getDB } from '../config/mongodb'

const chapterCollectionName = 'chapters'

const createNew = async (data) => {
    try {
        const number = await getDB().collection(chapterCollectionName).find({ comicID: data.comicID, _destroy: false }).count()
        data.chap = number + 1
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

const getFullChapter = async (id) => {
    try {
        const result = await ChapterModel.getFullChapter(id)
        return result
    } catch (error) {
        throw new Error(error)
    }
}

export const ChapterService = {
    createNew,
    update,
    getAllChapterOfComic,
    getFullChapter
}