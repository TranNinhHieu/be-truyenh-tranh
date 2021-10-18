import Joi from 'joi'
import { getDB } from '../config/mongodb'
// Define Tag collection
const tagCollectionName = 'tags'
const tagCollectionSchema = Joi.object({
    name: Joi.string().required().min(3).max(100),
    _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
    return await tagCollectionSchema.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
    try {
        const value = await validateSchema(data)
        const checkExist = await getDB().collection(tagCollectionName).findOne({ name: value.name, _destroy: false })

        if (checkExist)
            return null
        else {
            const result = await getDB().collection(tagCollectionName).insertOne(value)
            return result
        }

    } catch (error) {
        console.log(error)
    }
}

export const TagModel = { createNew }