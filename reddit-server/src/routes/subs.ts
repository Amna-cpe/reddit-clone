import { NextFunction, Request, Response, Router } from "express"
import { getRepository, QueryBuilder } from "typeorm"
import multer, { FileFilterCallback } from 'multer'
import fs from 'fs'
import path from "path"

import Sub from "../entities/Sub"
import auth from "../middleware/auth"
import allUsers from '../middleware/allUsers'
import Post from "../entities/Post"
import { makeid } from "../utill/helperFunctions"
import { isEmpty } from "class-validator"



const createSub = async (req: Request, res: Response) => {

    console.log(req.body)
    const { name, title, description } = req.body

    const user = res.locals.user

    try {
        let errors: any = {}
        if (name.trim() === '') errors.name = 'Name must not be empty'
        if (title.trim() === '') errors.title = 'Title must not be empty'

        // if user lower or capital the name
        const sub = await getRepository(Sub)
            .createQueryBuilder('sub')
            .where('lower(sub.name) = :name', { name: name.toLowerCase() })
            .getOne()

        if (sub) errors.name = 'Sub already exists'


        if (Object.keys(errors).length > 0) {
            throw errors
        }


    } catch (error) {
        return res.status(400).json(error)
    }

    try {


        const sub = new Sub({ name, title, description, user })
        await sub.save()

        return res.status(200).json(sub)

    } catch (error) {
        return res.status(500).json(error);
    }





}

const getSubPosts = async (req: Request, res: Response) => {
    const subName = req.params.name
    try {
        const sub = await Sub.findOneOrFail({ name: subName })
        const posts = await Post.find({
            where: { sub },
            order: { createdAt: 'DESC' },
            relations: ['comments', 'votes']
        })

        sub.posts = posts

        if (res.locals.user) {
            sub.posts.forEach(post => post.setUserVoted(res.locals.user))
        }


        return res.status(200).json(sub)

    } catch (error) {
        return res.status(404).json({ sub: 'There are no sub' })

    }

}
//multer middleware

const upload = multer({
    storage: multer.diskStorage({
        destination: 'public/images',
        filename: (_, file, callback) => {
            const fileName = makeid(14)
            callback(null, fileName + path.extname(file.originalname)) // dfgfgfd.png
        },
    })
    ,
    fileFilter: (_, file: any, callback: FileFilterCallback) => {

        //check i ffile is an image
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            callback(null, true)
        } else {
            callback(new Error('Not an image'))
        }

    }
})


// TO CHECK IF THE SUB IS THE USER OWNER OR NOT
const owner = async (req: Request, res: Response, next: NextFunction) => {

    const subName = req.params.name
    const user = res.locals.user
    try {
        const sub = await Sub.findOneOrFail({ where: { name: subName } })

        if (sub.username !== user.username) {
            return res.status(403).json({ error: 'Not allowed to make changes to this Sub' })
        }

        res.locals.sub = sub

        return next()

    } catch (error) {

        return res.status(500).json({ error: 'Something went wrong in the owner' })

    }

}

const postImageSub = async (req: Request, res: Response) => {

    const file = req.file
    const type = req.body.type
    const sub: Sub = res.locals.sub
    let oldImage: string = ""

    //delete the old one and replcae it with the new one

    try {

        if (type !== 'image' && type !== 'banner') {
            // NEED TO DELETE THE UPLOAEFE FILE
            fs.unlinkSync(file.path)
            return res.status(400).json({ error: 'Not supported type' })
        }

        if (type === 'image') {
            oldImage = sub.imageUrn || ''
            sub.imageUrn = file.filename
        }
        else if (type === 'banner') {
            oldImage = sub.bannerUrn || ''
            sub.bannerUrn = file.filename
        }

        await sub.save()

        if (oldImage !== '') {
            deleteFromDiskImages(oldImage)
        }

        return res.json(sub)


    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'something went wrong' })
    }

}

const deleteFromDiskImages = async (image: string) => {

    fs.stat(`public\\images\\${image}`, function (err, _) {

        if (err) {
            return console.error(err);
        }

        fs.unlink(`public\\images\\${image}`, function (err) {
            if (err) return console.log(err);
            console.log('file deleted successfully');
        });
    });
}

const serachSubs = async (req: Request, res: Response) => {

    try {
        const name = req.params.name;
        console.log("the name is ", name)
        if (isEmpty(name)) return res.status(400).json({ error: "Name must not be empty" })

        const subs = await getRepository(Sub)
            .createQueryBuilder()
            .where('LOWER(name) LIKE :name', { name: `%${name.toLowerCase().trim()}%` })
            .getMany()

        return res.json(subs)

    } catch (error) {
          return res.status(500).json({error: 'something went wrong'} )
    }

}

const router = Router()

router.post('/', allUsers, auth, createSub)
router.get('/:name', allUsers, getSubPosts)
router.get('/search/:name', serachSubs)
router.post('/:name/image', allUsers, auth, owner, upload.single('image'), postImageSub)


export default router;

