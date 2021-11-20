import { UserService } from '../services/user.service'
import { HttpStatusCode } from '../utilities/constants'
import { env } from '../config/enviroment'
import { jwtHelper } from '../helpers/jwt.helper'
import { mailHelper } from '../helpers/mail.helper'
import { OAuth2Client } from 'google-auth-library'
import bcrypt from 'bcrypt'
import { UserModel } from '../models/user.model'

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID)
const CLIENT_URL = process.env.NODE_ENV === 'production' ? 'https://comic-riverdev-api.herokuapp.com' : 'http://localhost:8080'

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
                return res.status(HttpStatusCode.OK).json({ accessToken, refreshToken })
            } catch (error) {
                return res.status(HttpStatusCode.INTERNAL_SERVER).json(error)
            }
        }

        if (userData === null ) {
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
                return res.status(HttpStatusCode.OK).json({ accessToken, refreshToken })
            } catch (error) {
                return res.status(HttpStatusCode.INTERNAL_SERVER).json(error)
            }
        }

        if (userData === undefined)
            return res.status(HttpStatusCode.OK).json({ message: 'Incorrect password!' })

    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const update = async (req, res) => {
    try {
        const { userID } = req.params
        const data = {
            ...req.body,
            updateAt: Date.now()
        }
        const result = await UserModel.update(userID, data)
        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const likeStatus = async (req, res) => {
    try {
        const { userID, comicID } = req.query
        const result = await UserModel.likeStatus(userID, comicID)
        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const followStatus = async (req, res) => {
    try {
        const { userID, comicID } = req.query
        const result = await UserModel.followStatus(userID, comicID)
        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const updateLikeComic = async (req, res) => {
    try {
        const { userID, comicID } = req.query
        const result = await UserModel.updateLikeComic(userID, comicID)
        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const updateFollowComic = async (req, res) => {
    try {
        const { userID, comicID } = req.query
        const result = await UserModel.updateFollowComic(userID, comicID)
        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const getLikedComics = async (req, res) => {
    try {
        const { userID, page } = req.query
        const result = await UserService.getLikedComics(userID, page)
        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const getFollowedComics = async (req, res) => {
    try {
        const { userID, page } = req.query
        const result = await UserService.getFollowedComics(userID, page)
        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const getQuantityPageLikedComics = async (req, res) => {
    try {
        const { userID } = req.query
        const result = await UserService.getQuantityPageLikedComics(userID)
        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const getQuantityPageFollowedComics = async (req, res) => {
    try {
        const { userID } = req.query
        const result = await UserService.getQuantityPageFollowedComics(userID)
        res.status(HttpStatusCode.OK).json(result)
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const register = async (req, res) => {
    try {

        const passwordHash = await bcrypt.hash(req.body.password, 12)

        const newUser = {
            name: req.body.name,
            email: req.body.email,
            password: passwordHash
        }

        const activationToken = await jwtHelper.createActiveToken(newUser, env.ACTIVE_TOKEN_SECRET, env.ACTIVE_TOKEN_LIFE)
        const url = `${CLIENT_URL}/v1/user/verify-email/${activationToken}`

        mailHelper.sendMail(req.body.email, url, 'Xác minh')

        res.status(HttpStatusCode.OK).json({ message: 'Register success! Please activate your email to start.' })

    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const verifyEmail = async (req, res) => {
    try {

        const { verify } = req.params

        const decode = await jwtHelper.verifyToken(verify, env.ACTIVE_TOKEN_SECRET)
        const userData = decode.data
        const checkUser = await UserService.checkExist(userData.email)
        let result = 'Already vefified!'
        if (!checkUser)
            result = await UserModel.createNew(userData)
        res.status(HttpStatusCode.OK).json(result)

    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const forgotPassword = async (req, res) => {
    try {

        const { email } = req.body

        const checkUser = await UserService.checkExist(email)

        if (!checkUser)
            return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'This email does not exist!' })

        const activationToken = await jwtHelper.createActiveToken(checkUser, env.ACTIVE_TOKEN_SECRET, env.ACTIVE_TOKEN_LIFE)
        const url = `${CLIENT_URL}/v1/user/confirm-token?token=${activationToken}&email=${email}`
        mailHelper.sendMail(req.body.email, url, 'Reset password')

        res.status(HttpStatusCode.OK).json({ token: activationToken, message: 'Please check email to verify!' })

    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const confirmToken = async (req, res) => {
    try {
        const { token, email } = req.query
        const checkUser = await UserService.checkExist(email)
        await UserModel.update(checkUser._id, { resetLink: token })
        res.status(HttpStatusCode.OK).json({ message: 'Verified!' })
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER).json({
            errors: error.message
        })
    }
}

const resetPassword = async (req, res) => {
    try {

        const { password, verify } = req.body

        const passwordHash = await bcrypt.hash(password, 12)

        const decode = await jwtHelper.verifyToken(verify, env.ACTIVE_TOKEN_SECRET)

        const token = await UserModel.getResetLink(decode.data._id)

        if (token.resetLink === verify) {
            await UserModel.update(decode.data._id, { password: passwordHash, resetLink: '' })
            res.status(HttpStatusCode.OK).json({ message: 'Password has been changed!' })
        } else
            res.status(HttpStatusCode.OK).json({ message: 'Reset link expired or incorrect!' })

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
    logout,
    update,
    likeStatus,
    followStatus,
    updateLikeComic,
    updateFollowComic,
    getLikedComics,
    getFollowedComics,
    getQuantityPageFollowedComics,
    getQuantityPageLikedComics,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    confirmToken
}