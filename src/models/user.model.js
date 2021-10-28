import Joi from 'joi'
import bcrypt from 'bcrypt'
import { ObjectID } from 'mongodb'
import { getDB } from '../config/mongodb'
// Define user collection
const userCollectionName = 'users'
const userCollectionSchema = Joi.object({
    name: Joi.string().required().min(5).max(50).trim(),
    email: Joi.string().required().min(15).max(50).trim(),
    password: Joi.string().required().min(8).trim(),
    avatar: Joi.string().default(''),
    isAdmin: Joi.boolean().default(false),
    createAt: Joi.date().timestamp().default(Date.now()),
    updateAt: Joi.date().timestamp().default(null),
    _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
    return await userCollectionSchema.validateAsync(data, { abortEarly: false })
}

const login = async (data) => {
    try {

        let user = await getDB().collection(userCollectionName).findOne(
            { email: data.email, _destroy: false })

        if (!user) return null
        const isMatch = await bcrypt.compare(data.password, user.password)
        if (!isMatch)
            return undefined
        else {
            const userInfo = { _id: user._id }
            return userInfo
        }

    } catch (error) {
        throw new Error(error)
    }
}

const getFullUser = async (id) => {
    try {
        const userData = await getDB().collection(userCollectionName).findOne(
            { _id: ObjectID(id), _destroy: false },
            { projection: { name: 1, email: 1, avatar: 1 } } )
        return userData
    } catch (error) {
        throw new Error(error)
    }
}
export const UserModel = {
    login,
    getFullUser
}