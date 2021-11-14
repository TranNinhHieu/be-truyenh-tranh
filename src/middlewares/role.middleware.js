import { HttpStatusCode } from '../utilities/constants'

const isAdmin = async (req, res, next) => {
    try {
        const { role } = req.params || req.query
        if (role)
            next()
        else return res.status(HttpStatusCode.BAD_REQUEST).json({
            message: 'Admin role!'
        })
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

export const RoleMiddleware = { isAdmin }