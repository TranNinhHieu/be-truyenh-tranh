require('dotenv').config()

export const env = {
    MONGODB_URI: process.env.MONGODB_URI,
    APP_HOST: process.env.APP_HOST,
    APP_PORT: process.env.APP_PORT,
    DATABASE_NAME: process.env.DATABASE_NAME,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_LIFE: process.env.ACCESS_TOKEN_LIFE,
    REFRESH_TOKEN_LIFE: process.env.REFRESH_TOKEN_LIFE,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET
}