import Joi from 'joi'
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
        const number = await getDB().collection(chapterCollectionName).find({ comicID: value.comicID, _destroy: false }).count()
        value.number = number + 1
        const result = await getDB().collection(chapterCollectionName).insertOne(value)
        return result

    } catch (error) {
        console.log(error)
    }
}

export const ChapterModel = { createNew }