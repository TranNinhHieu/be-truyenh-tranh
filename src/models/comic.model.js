import Joi from 'joi'
import { getDB } from '../config/mongodb'
// Define Comic collection
const comicCollectionName = 'comics'
const comicCollectionSchema = Joi.object({
    number: Joi.number().default(0),
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().default('Đang cập nhật'),
    tagID: Joi.array().items(Joi.string()).required(),
    thumbnail: Joi.string().required(),
    author: Joi.string().default('Đang cập nhật'),
    status: Joi.string().default('Chưa hoàn thành'),
    view: Joi.number().default(0),
    createAt: Joi.date().timestamp().default(Date.now()),
    updateAt: Joi.date().timestamp().default(null),
    _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
    return await comicCollectionSchema.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
    try {
        const value = await validateSchema(data)
        const number = await getDB().collection(comicCollectionName).count()
        value.number = number + 1
        const result = await getDB().collection(comicCollectionName).insertOne(value)
        return result

    } catch (error) {
        console.log(error)
    }
}

export const ComicModel = { createNew }