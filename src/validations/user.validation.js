import { HttpStatusCode } from '../utilities/constants'

const login = (req, res, next) => {

    try {
        const { email, password } = req.body
        // return 400 status if username/password is not exist
        if (!email || !password) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                error: true,
                message: 'Username or Password required.'
            })
        } else
        if (password.length < 8)
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                error: true,
                message: 'Password must least at 8 charaters.'
            })
        else next()
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

export const UserValidation = {
    login
}