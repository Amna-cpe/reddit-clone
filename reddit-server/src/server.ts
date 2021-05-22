import "reflect-metadata";
import { createConnection } from "typeorm";
import express from 'express'
import morgan from 'morgan'
import dotenv from "dotenv";
import cookieParser from 'cookie-parser'
import cors from "cors"

import authRoutes from './routes/auth'
import postsRoutes from './routes/posts'
import subsRoutes from './routes/subs'
import generalRoutes from './routes/general'
import usersRoutes from "./routes/users"

import trim from "./middleware/trim"

const app = express()
dotenv.config()
app.use(cors({
    credentials:true,
    origin:process.env.ORIGIN,
    optionsSuccessStatus:200
}))
app.use(cookieParser())
app.use(express.json())
app.use(morgan('dev'))
app.use(trim)
app.use(express.static('public'))


app.use('/api/auth', authRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/subs', subsRoutes)
app.use('/api/general', generalRoutes)
app.use('/api/user',usersRoutes)



app.get('/', (_req, res) => {
    res.send('hello word')
})


app.listen(process.env.PORT, async () => {
    try {
        await createConnection()
        console.log('connected to the database ❤❤❤')

    } catch (error) {
        console.log('error ', error)
    }
})