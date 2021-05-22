import { isEmpty, validate } from "class-validator"
import { Request, Response, Router } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import cookie from 'cookie'

import User from '../entities/User'
import auth from '../middleware/auth'
import allUsers from '../middleware/allUsers'


const mapErrors = (errors: Object[]): object => {
    //EACH ERROR IN ERRORS ARRAY
    //CONTAINT A CONSTRAINTS --> the msgs (the first msg is)[0][1]
    // the 'property' holds the name of the error
    //   let mapErrors:any = {}
    //     errors.forEach((e:any)=>{
    //         const key = e.property;
    //         const value = Object.entries(e.constraints)[0][1]
    //         mapErrors[key] = value

    //     })
    //     return mapErrors
    // Object.entries : is to tranfer object into array
    return errors.reduce((prev: any, err: any) => {
        prev[err.property] = Object.entries(err.constraints)[0][1]
        return prev
    }, {})


}
const register = async (req: Request, res: Response) => {

    const { email, username, password } = req.body

    try {
        // VALIDATE
        let errors: any = {}
        const emailUser = await User.findOne({ email })
        const usernameUser = await User.findOne({ username })

        if (emailUser) errors.email = "Email is already taken"
        if (usernameUser) errors.username = "Username is already taken"

        if (Object.keys(errors).length > 0) return res.status(400).json(errors)

        // CREATE USER
        const user = new User({ email, username, password })
        errors = await validate(user)

        if (errors.length > 0) return res.status(400).json(mapErrors(errors))

        await user.save()

        // RETURN THE USER
        return res.json(user)

    } catch (error) {
        console.log(error)
        return res.status(500).json(error)

    }


}

const login = async (req: Request, res: Response) => {

    const { username, password } = req.body
    try {
        let errors: any = {}

        if (isEmpty(username)) errors.username = 'Username must not be empty'
        if (isEmpty(password)) errors.password = 'Password must not be empty'
        if (Object.keys(errors).length > 0) {
            return res.status(400).json(errors)
        }

        //get the user if exit
        const user = await User.findOne({ username })
        // error
        if (!user) {
            return res.status(400).json({ username: 'User not found' })
        }
        //comapre passwro
        const passwordDidMatch = await bcrypt.compare(password, user.password)
        //error if not match
        if (!passwordDidMatch) {
            return res.status(400).json({ password: "Password is incorrect" });
        }

        //token 
        const token = jwt.sign({ username }, process.env.JWT_SECRET!)

        //cookie
        res.set(
            'Set-Cookie',
            cookie.serialize('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600,
                path: '/',
            })
        )
        return res.json(user)


    } catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
}

const whoami = (_: Request, res: Response) => {
    return res.json(res.locals.user)
}

const logout = async (_req: Request, res: Response) => {
    //cookie
    res.set(
        'Set-Cookie',
        cookie.serialize('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0),
            path: '/',
        })

    )
    return res.status(200).json({ success: true })
}

const router = Router()
router.post('/register', register)
router.post('/login', login)
router.get('/whoami', allUsers , whoami)
router.get('/logout', allUsers , auth, logout)

export default router