import { UserService } from '../services/user.service'
import { HttpStatusCode } from '../utilities/constants'
import { env } from '../config/enviroment'
import { jwtHelper } from '../helpers/jwt.helper'
import { OAuth2Client } from 'google-auth-library'
import bcrypt from 'bcrypt'

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID)

const login = async (req, res) => {
    try {
        const userData = await UserService.login(req.body)
        if (userData !== null && userData !== undefined) {
            try {
                const accessToken = await jwtHelper.generateToken(userData, env.ACCESS_TOKEN_SECRET, env.ACCESS_TOKEN_LIFE)
                const refreshToken = await jwtHelper.generateToken(userData, env.REFRESH_TOKEN_SECRET, env.REFRESH_TOKEN_LIFE)
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    path: '/v1/user/refresh-token',
                    maxAge: 30*24*60*60*1000,
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                    secure: process.env.NODE_ENV === 'production' ? true : false
                })
                res.status(HttpStatusCode.OK).json({ accessToken, refreshToken })
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
    const token = req.cookies.refreshToken
    if (token === refreshTokenFromClient) {
        try {
            const decoded = await jwtHelper.verifyToken(refreshTokenFromClient, env.REFRESH_TOKEN_SECRET)

            const userData = decoded.data

            const accessToken = await jwtHelper.generateToken(userData, env.ACCESS_TOKEN_SECRET, env.ACCESS_TOKEN_LIFE)

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

const logout = async (req, res) => {

    try {
        res.clearCookie('refreshToken', { path: '/v1/user/refresh-token' })
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
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    path: '/v1/user/refresh-token',
                    maxAge: 30*24*60*60*1000,
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                    secure: process.env.NODE_ENV === 'production' ? true : false
                })
                res.status(HttpStatusCode.OK).json({ accessToken, refreshToken })
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
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    path: '/v1/user/refresh-token',
                    maxAge: 30*24*60*60*1000,
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                    secure: process.env.NODE_ENV === 'production' ? true : false
                })
                res.status(HttpStatusCode.OK).json({ accessToken, refreshToken })
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