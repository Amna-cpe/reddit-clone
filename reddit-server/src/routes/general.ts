import { Request, Response, Router } from "express"
import Post from "../entities/Post"

import User from '../entities/User'
import auth from '../middleware/auth'
import allUsers from '../middleware/allUsers'
import Vote from '../entities/Vote'
import Comment from "../entities/Comment"
import Sub from "../entities/Sub"
import { getConnection } from "typeorm"

//vote on a comment or post 
const vote = async (req: Request, res: Response) => {


    const { identifier, slug, commentIdentifier, value } = req.body

    // validate vote values
    if (![1, 0, -1].includes(value)) {
        return res.status(400).json({ value: 'Not a valid vote value' })
    }
    try {
        const user: User = res.locals.user
        let post = await Post.findOneOrFail({ identifier, slug })
        let vote: Vote | undefined // only the type
        let comment: Comment | undefined // only specifying the type

        // VOTE ON A COMMENT
        if (commentIdentifier) {

            comment = await Comment.findOneOrFail({ identifier: commentIdentifier })
            // CHECK IF THERE IS A VOTE obj BEEN MADE TO THIS COMMENT
            vote = await Vote.findOne({ user, comment })

        }
        else {
            // VOTE ON A POST

            // it is gonna fail here cuz it does not find a vote!!
            vote = await Vote.findOne({ user, post })

        }

        // NOW IF WE HAVE THE VOTE FOR EITHER THE COMMETN OR THE POST

        if (!vote && value === 0) {
            // IF IT IS THE FIRST VOTE TO THIS POST/COMMENT
            // AND WANT TO VOTE 0 this is an error 
            // NO ACTUAL VOTE TO VOTE!
            return res.status(404).json({ error: 'Vote not found' })

        }
        else if (!vote) {
            // NO VOTE BUT THE VALU IS CORRECT
            // CREATE A VOTE 
            console.log('you are craeting the vote?')
            vote = new Vote({ user, value })
            if (comment) vote.comment = comment
            else vote.post = post
            await vote.save()
        } else if (value === 0) {
            // IF VOTE EXIST AND VALUE = 0
            // REMOVE VOTE FROM DB (reset)
            await vote.remove()
        } else if (vote.value !== value) {
            // WHEN THE USER VOTE THE SAME VALUE
            // OVER AND OVER , DO NOTHING
            // BUT WHEN IT DIFFRENT CAHNGE IT
            vote.value = value
            await vote.save()
        }

        //refetch the post with commetn
        post = await Post.findOneOrFail({ identifier, slug }, { relations: ['comments', 'sub', 'votes', 'comments.votes'] })
        post.setUserVoted(user)
        post.comments.forEach(comment => comment.setUserVoted(user))
        return res.status(200).json(post)


    } catch (error) {
        return res.status(400).json({ error: 'i dont know why!!' })
    }

}

const topSubs = async (_: Request, res: Response) => {

    try {
        const imageUrlExp = `COALESCE(concat('${process.env.APP_URL}/images/' , s.imageUrn) , 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y')`

        const subs = await getConnection()
            .createQueryBuilder()
            .select(`s.title, s.name , ${imageUrlExp} as imageUrl , count(p.id) as postsCount`)
            .from(Sub, 's')
            .leftJoin(Post, 'p', `s.name = p.subName`)
            .groupBy('s.title, s.name ,imageUrl')
            .orderBy(`postsCount`, 'DESC')
            .limit(5)
            .execute()

        return res.json(subs)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "something went wrong in the subs" })
    }
}

const router = Router()
router.post('/vote', allUsers, auth, vote)
router.get('/topSubs', topSubs)


export default router