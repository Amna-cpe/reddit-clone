import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import User from '../entities/User'

export default async (req: Request, res: Response, next: NextFunction) => {

    try {

        const token = req.cookies.token;
        // if there is no user , its ok just move on 
        // with out error
        if (!token) return next()


        // IF THERE IS A TOKEN THEN STOP TO AUTH
        const { username }: any = jwt.verify(token, process.env.JWT_SECRET!)
        const user = await User.findOne({ username })
        
        if (!user) throw new Error('Unauthenticated')

        res.locals.user = user // attach and send
        
        return next()


    } catch (error) {
        return res.status(401).json({ error: 'Unauthenticated' })
    }


}