import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import User from '../entities/User'

export default async (_: Request, res: Response, next: NextFunction) => {

    try {
        console.log(res.locals.user)

        const user: User | undefined = res.locals.user


        if (!user) throw new Error('Unauthenticated')

        return next()

    } catch (error) {
        console.log(error)
        return res.status(401).json({ error: 'Unauthenticated' })


    }


}