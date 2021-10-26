import { UserModel } from '../models/user.model'

const login = async (data) => {
    try {
        const result = await UserModel.login(data)
        return result

    } catch (error) {
        throw new Error(error)
    }
}

const getFullUser = async (id) => {
    try {
        const userData = await UserModel.getFullUser(id)
        return userData
    } catch (error) {
        throw new Error(error)
    }
}
export const UserService = {
    login,
    getFullUser
}
