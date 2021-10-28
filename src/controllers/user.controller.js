import { UserService } from '../services/user.service'
import { HttpStatusCode } from '../utilities/constants'
import { env } from '../config/enviroment'
import { jwtHelper } from '../helpers/jwt.helper'
import { OAuth2Client } from 'google-auth-library'
import { TokenModel } from '../models/token.model'
import bcrypt from 'bcrypt'

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID)

const login = async (req, res) => {
    try {
        const userData = await UserService.login(req.body)
        if (userData !== null && userData !== undefined) {
            try {
                const accessToken = await jwtHelper.generateToken(userData, env.ACCESS_TOKEN_SECRET, env.ACCESS_TOKEN_LIFE)
                const refreshToken = await jwtHelper.generateToken(userData, env.REFRESH_TOKEN_SECRET, env.REFRESH_TOKEN_LIFE)
                const token = await TokenModel.createNew(refreshToken, accessToken)
                if (token)
                    return res.status(HttpStatusCode.OK).json({ accessToken, refreshToken })
            } catch (error) {
                return res.status(HttpStatusCode.INTERNAL_SERVER).json(error)
            }
        }

        if (userData === null)
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                error: true,
                message: 'Email does not exist!'
            })
        if (userData === undefined)
            return res.status(HttpStatusCode.BAD_REQUEST).json({
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

    const refreshTokenFromClient = req.body.refreshToken || req.query.refreshToken
    const token = await TokenModel.getRefreshToken(refreshTokenFromClient)
    if (token === true) {
        try {
            const decoded = await jwtHelper.verifyToken(refreshTokenFromClient, env.REFRESH_TOKEN_SECRET)

            const userData = decoded.data

            const accessToken = await jwtHelper.generateToken(userData, env.ACCESS_TOKEN_SECRET, env.ACCESS_TOKEN_LIFE)
            await TokenModel.update(refreshTokenFromClient, accessToken)
            return res.status(200).json({ accessToken })
        } catch (error) {
            await TokenModel.remove(refreshTokenFromClient)
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

const logout = async (req, res) => {
    const refreshTokenFromClient = req.body.refreshToken || req.query.refreshToken
    try {
        await TokenModel.remove(refreshTokenFromClient)
        res.status(HttpStatusCode.OK).json({ message: 'Logged out!' })
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({ message: error.message })
    }
}

const googleLogin = async (req, res) => {

    const { tokenId } = req.body
    const verify = await client.verifyIdToken({ idToken: tokenId, audience: env.GOOGLE_CLIENT_ID })
    const { email_verified, email, name, picture } = verify.payload

    const password = email + env.GOOGLE_SECRET
    const passwordHash = await bcrypt.hash(password, 12)

    if (!email_verified) return res.status(400).json({ message: 'Email verification failed.' })

    let data = ({ email: email, password: password })

    try {
        let userData = await UserService.login(data)
        if (userData !== null && userData !== undefined) {
            try {
                const accessToken = await jwtHelper.generateToken(userData, env.ACCESS_TOKEN_SECRET, env.ACCESS_TOKEN_LIFE)
                const refreshToken = await jwtHelper.generateToken(userData, env.REFRESH_TOKEN_SECRET, env.REFRESH_TOKEN_LIFE)
                const token = await TokenModel.createNew(refreshToken, accessToken)
                if (token)
                    return res.status(HttpStatusCode.OK).json({ accessToken, refreshToken })
            } catch (error) {
                return res.status(HttpStatusCode.INTERNAL_SERVER).json(error)
            }
        } else {
            data = ({ name: name, email: email, password: passwordHash, avatar: picture })
            await UserService.createNew(data)
            userData = await UserService.checkExist(email)
            try {
                const accessToken = await jwtHelper.generateToken(userData, env.ACCESS_TOKEN_SECRET, env.ACCESS_TOKEN_LIFE)
                const refreshToken = await jwtHelper.generateToken(userData, env.REFRESH_TOKEN_SECRET, env.REFRESH_TOKEN_LIFE)
                const token = await TokenModel.createNew(refreshToken, accessToken)
                if (token)
                    return res.status(HttpStatusCode.OK).json({ accessToken, refreshToken })
            } catch (error) {
                return res.status(HttpStatusCode.INTERNAL_SERVER).json(error)
            }
        }
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}
export const UserController = {
    login,
    refreshToken,
    getFullUser,
    googleLogin,
    logout
}