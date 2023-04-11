import express from 'express'
import cors from 'cors'
import { connectDB } from './config/mongodb'
import { env } from './config/enviroment'
import { apiV1 } from './routes/v1'
import { corsConfig } from './config/cors'

connectDB()
    .then(() => console.log('Connected successfully to database server!'))
    .then(() => bootServer())
    .catch(error => {
        console.error(error)
        process.exit(1)
    })

const bootServer = () => {
    const app = express()

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(cors(corsConfig))

    app.use('/v1', apiV1)

    app.listen(env.APP_PORT || process.env.PORT, () => {
        console.log(`Hello Comic, I'm running at :${process.env.PORT}/`)
    })
}