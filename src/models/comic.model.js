import Joi from 'joi'
import { ObjectID } from 'mongodb'
import { getDB } from '../config/mongodb'
// Define Comic collection
const comicCollectionName = 'comics'
const comicCollectionSchema = Joi.object({
    number: Joi.number().default(0),
    title: Joi.string().required().min(3).max(100).trim(),
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
        const tagID = value.tagID.map(tag => ObjectID(tag))
        const valueValidated = {
            ...value,
            tagID: tagID,
            createAt: Date.now()
        }
        const result = await getDB().collection(comicCollectionName).insertOne(valueValidated)
        return result

    } catch (error) {
        throw new Error(error)
    }
}

const update = async (id, data) => {
    try {
        const result = await getDB().collection(comicCollectionName).findOneAndUpdate(
            { _id: ObjectID(id) },
            { $set: data },
            { returnOriginal: false }
        )
        return result

    } catch (error) {
        throw new Error(error)
    }
}

const getComic = async (page) => {
    try {

        const listComic = await getDB().collection(comicCollectionName)
            .find({ _destroy: false })
            .project({
                number: 1,
                title: 1,
                thumbnail: 1,
                createAt: 1
            })
            .sort({ createAt: -1 }).toArray()
        const begin = (page - 1)*12
        const end = page*12
        const result = listComic.slice(begin, end)

        return { comics: result, quantityComic: listComic.length }

    } catch (error) {
        throw new Error(error)
    }
}

const getDetailComic = async (id) => {
    try {
        const comic = await getDB().collection(comicCollectionName).aggregate([
            { $match: { _id: ObjectID(id), _destroy: false } },
            { $project: { number: 0, updateAt: 0, _destroy: 0 } },
            {
                $lookup: {
                    from: 'tags',
                    localField: 'tagID',
                    foreignField: '_id',
                    as: 'tags'
                }
            },
            { $project: { tagID: 0 } }
        ]).toArray()
        return comic[0]
    } catch (error) {
        throw new Error(error)
    }
}

const getAllComicOfTag = async (tagID, page) => {
    try {
        const listComic = await getDB().collection(comicCollectionName)
            .find(
                {
                    tagID: ObjectID(tagID),
                    _destroy: false
                },
                { projection: { number: 1, title: 1, thumbnail: 1, createAt: 1 } }).sort({ createAt: -1 }).toArray()
        const begin = (page-1)*12
        const end = page*12
        const result = listComic.slice(begin, end)
        return result
    } catch (error) {
        throw new Error(error)
    }
}

const getQuantityPage = async (tagID) => {
    try {

        let quantity = 0
        if (tagID === undefined) {
            const listComic = await getDB().collection(comicCollectionName).find({ _destroy: false }).count()
            quantity = Math.ceil(listComic/12)
        } else {
            if (tagID == 0) {
                const listComic = await getDB().collection(comicCollectionName).find({ tagID: ObjectID('616af71268f59ad44354b30f'), _destroy: false }).count()
                quantity = Math.ceil(listComic/12)
            } else {
                const listComic = await getDB().collection(comicCollectionName).find({ tagID: ObjectID(tagID), _destroy: false }).count()
                quantity = Math.ceil(listComic/12)
            }
        }
        return quantity
    } catch (error) {
        throw new Error(error)
    }
}

const getFollownLike = async (comicID) => {
    try {
        const follow = await getDB().collection(comicCollectionName).aggregate([
            { $match: { _id: ObjectID(comicID), _destroy: false } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'follow',
                    as: 'quantity'
                }
            }, {
                $unwind: '$quantity'
            }
        ]).toArray()

        const like = await getDB().collection(comicCollectionName).aggregate([
            { $match: { _id: ObjectID(comicID), _destroy: false } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'like',
                    as: 'quantity'
                }
            }, {
                $unwind: '$quantity'
            }
        ]).toArray()

        const comment = await getDB().collection('comments').find({
            comicID: ObjectID(comicID)
        }).count()

        return { likes: like.length, follows: follow.length, comments: comment }
    } catch (error) {
        throw new Error(error)
    }
}

const getUnfinishedComics = async () => {
    try {
        const result = getDB().collection(comicCollectionName).find({
            status: 'Chưa hoàn thành',
            _destroy: false
        }, { projection: { number: 1, title: 1, thumbnail: 1, createAt: 1 } }).sort({ createAt: -1 }).toArray()
        return result
    } catch (error) {
        throw new Error(error)
    }
}

export const ComicModel = {
    createNew,
    update,
    getComic,
    getDetailComic,
    getAllComicOfTag,
    getQuantityPage,
    getFollownLike,
    getUnfinishedComics
}