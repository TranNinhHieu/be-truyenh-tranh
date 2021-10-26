import { UserService } from '../services/user.service'
import { HttpStatusCode } from '../utilities/constants'
import { env } from '../config/enviroment'
import { jwtHelper } from '../helpers/jwt.helper'

let tokenList = {}

const login = async (req, res) => {
    try {
        const userData = await UserService.login(req.body)
        if (userData !== null && userData !== undefined) {
            try {
                const accessToken = await jwtHelper.generateToken(userData, env.ACCESS_TOKEN_SECRET, env.ACCESS_TOKEN_LIFE)
                const refreshToken = await jwtHelper.generateToken(userData, env.REFRESH_TOKEN_SECRET, env.REFRESH_TOKEN_LIFE)

                tokenList[refreshToken] = { accessToken, refreshToken }

                return res.status(HttpStatusCode.OK).json({ accessToken, refreshToken })
            } catch (error) {
                return res.status(HttpStatusCode.INTERNAL_SERVER).json(error)
            }
        }

        if (userData === null)
            return res.status(HttpStatusCode.UNAUTHORIZED).json({
                error: true,
                message: 'Email does not exist!'
            })
        if (userData === undefined)
            return res.status(HttpStatusCode.UNAUTHORIZED).json({
                error: true,
                message: 'Username or Password is Wrong.'
            })
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const refreshToken = async (req, res) => {

    const refreshTokenFromClient = req.body.refreshToken

    if (refreshTokenFromClient && (tokenList[refreshTokenFromClient])) {
        try {
            const decoded = await jwtHelper.verifyToken(refreshTokenFromClient, env.REFRESH_TOKEN_SECRET)

            const userFakeData = decoded.data

            const accessToken = await jwtHelper.generateToken(userFakeData, env.ACCESS_TOKEN_SECRET, env.ACCESS_TOKEN_LIFE)

            return res.status(200).json({ accessToken })
        } catch (error) {

            res.status(403).json({
                message: 'Invalid refresh token.'
            })
        }
    } else {

        return res.status(403).send({
            message: 'No token provided.'
        })
    }
}

const getFullUser = async (req, res) => {
    try {
        const { id } = req. params
        const userData = await UserService.getFullUser(id)
        res.status(HttpStatusCode.OK).json(userData)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

export const UserController = {
    login,
    refreshToken,
    getFullUser
}