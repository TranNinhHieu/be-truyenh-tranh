import Joi from 'joi'
import { ObjectID } from 'mongodb'
import { getDB } from '../config/mongodb'
// Define Chapter collection
const chapterCollectionName = 'chapters'
const chapterCollectionSchema = Joi.object({
    comicID: Joi.string().required(),
    chap: Joi.number().default(0),
    image: Joi.array().items(Joi.string()).required(),
    createAt: Joi.date().timestamp().default(Date.now()),
    updateAt: Joi.date().timestamp().default(null),
    _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
    return await chapterCollectionSchema.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
    try {
        const value = await validateSchema(data)
        const result = await getDB().collection(chapterCollectionName).insertOne(value)
        return result

    } catch (error) {
        throw new Error(error)
    }
}

const update = async (id, data) => {
    try {
        const result = await getDB().collection(chapterCollectionName).findOneAndUpdate(
            { _id: ObjectID(id) },
            { $set: data },
            { returnOriginal: false }
        )
        return result

    } catch (error) {
        throw new Error(error)
    }
}

const getAllChapterOfComic = async (comicID) => {
    try {
        const result = await getDB().collection(chapterCollectionName).find(
            { comicID: comicID, _destroy: false },
            { projection: { chap: 1, createAt: 1, updateAt: 1 } }
        ).toArray()
        return result

    } catch (error) {
        throw new Error(error)
    }
}

const getFullChapter = async (id) => {
    try {
        const result = await getDB().collection(chapterCollectionName).findOne(
            { _id: ObjectID(id), _destroy: false },
            { projection: { comicID: 1, chap: 1, image: 1 } }
        )
        return result

    } catch (error) {
        throw new Error(error)
    }
}

export const ChapterModel = {
    createNew,
    update,
    getAllChapterOfComic,
    getFullChapter
}