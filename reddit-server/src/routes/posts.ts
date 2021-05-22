import { Request, Response, Router } from "express"
import Comment from "../entities/Comment"
import Post from "../entities/Post"
import Sub from "../entities/Sub"
import auth from "../middleware/auth"
import allUsers from '../middleware/allUsers'

const createPost = async (req: Request, res: Response) => {

    const { title, body, subName } = req.body

    const user = res.locals.user

    if (title.trim() === '') {
        return res.status(400).json({ title: 'Title must not be empty' })
    }

    try {
        // Find the sub object
        const subData = await Sub.findOneOrFail({ name: subName })
        //TODO: what about the subName??? how it gonna word?
        // the answer is in the join column 
        const post = new Post({ title, body, sub: subData, user })
        await post.save()

        return res.status(200).json(post)

    } catch (error) {
        return res.status(400).json({ error: error })
    }



}


const getPosts = async (req: Request, res: Response) => {

    const currentPage: number = (req.query.page || 0) as number
    const numPosts: number = (req.query.num || 4) as number

    try {
        const posts = await Post.find({
            order: { createdAt: "DESC" },
            relations: ['comments', 'sub', 'votes'],
            skip: currentPage * numPosts,
            take: numPosts,
        })

        // ON EVERY POST ATTACH USER VOTE ON IT
        console.log("the user wihtt the votes", res.locals.user)
        if (res.locals.user) {
            posts.forEach(p => p.setUserVoted(res.locals.user));
        }

        return res.status(200).json(posts)
    } catch (error) {

        return res.status(500).json({ error: "No posts" })

    }


}

const getPostComments = async (req: Request, res: Response) => {

    const { identifier, slug } = req.params

    try {
        //get the post
        const post = await Post.findOneOrFail({ identifier, slug })

        //get the comments of that post
        const comments = await Comment.find({
            where: { post },
            order: { createdAt: 'DESC' },
            relations: ['votes']
        });

        if (res.locals.user) {
            comments.forEach(com => com.setUserVoted(res.locals.user));
        }


        return res.json(comments)
    } catch (error) {

        return res.status(500).json({ error: "something went wrong" })

    }


}



const getPost = async (req: Request, res: Response) => {

    const { identifier, slug } = req.params

    try {
        const post = await Post.findOneOrFail({ identifier, slug }, {

            relations: ['sub', 'comments', 'votes'],


        })
        if (res.locals.user) {
            post.setUserVoted(res.locals.user)
        }

        return res.status(200).json(post)
    } catch (error) {

        return res.status(404).json({ error: "No post found" })

    }


}

const commentOnPost = async (req: Request, res: Response) => {

    const { identifier } = req.params
    const body = req.body.body
    console.log("the comment is ", body)

    try {
        const post = await Post.findOneOrFail({ identifier })
        const user = res.locals.user
        const newComment = new Comment({ post, body, user })
        await newComment.save()
        return res.status(200).json(newComment)

    } catch (error) {
        return res.status(404).json({ error: 'Post Not Found' })

    }


}

const router = Router()

router.post('/', allUsers, auth, createPost)
router.get('/', allUsers, getPosts)
router.get('/:identifier/:slug', allUsers, getPost)
router.get('/:identifier/:slug/comment', allUsers, getPostComments)
router.post('/:identifier/:slug/comment', allUsers, auth, commentOnPost)

export default router;

