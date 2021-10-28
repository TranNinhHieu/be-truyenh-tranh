import Joi from 'joi'
import { getDB } from '../config/mongodb'

const tokenCollectionName = 'tokens'

const tokenCollectionSchema = Joi.object({
    refreshToken: Joi.string().required(),
    accessToken: Joi.string().required()
})

const validateSchema = async (refreshToken, accessToken) => {
    return await tokenCollectionSchema.validateAsync(refreshToken, accessToken, { abortEarly: false })
}

const createNew = async (refreshToken, accessToken) => {
    try {
        // const value = await validateSchema(refreshToken, accessToken)
        const token = await getDB().collection(tokenCollectionName).insertOne({ refreshToken, accessToken })
        return token
    } catch (error) {
        throw new Error(error)
    }
}

const update = async (refreshToken, accessToken) => {
    try {
        const token = await getDB().collection(tokenCollectionName).findOneAndUpdate(
            { refreshToken: refreshToken },
            { $set: { accessToken: accessToken } },
            { returnOriginal: false }
        )
        return token
    } catch (error) {
        throw new Error(error)
    }
}

const remove = async (refreshToken) => {
    try {
        await getDB().collection(tokenCollectionName).findOneAndDelete({ refreshToken: refreshToken })
    } catch (error) {
        throw new Error(error)
    }
}

const getRefreshToken = async (refreshToken) => {
    const token = await getDB().collection(tokenCollectionName).findOne({ refreshToken })
    if (token)
        return true
    return false
}
export const TokenModel = {
    createNew,
    getRefreshToken,
    update,
    remove
}