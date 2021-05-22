import { Request, Response, Router } from "express";
import Comment from "../entities/Comment";
import Post from "../entities/Post";
import User from "../entities/User";
import allUsers from "../middleware/allUsers";

const getUserSubmissions = async (req: Request, res: Response) => {

    try {

        const user = await User.findOneOrFail({
            where: { username: req.params.username },
            select: ['username', 'createdAt']
        })



        const posts = await Post.find({
            where: { user },
            relations: ['comments', 'votes', 'sub']
        })

        const comments = await Comment.find({
            where: { user },
            relations: ['post']
        })

        // if the user logged in show the votes

        if (res.locals.user) {
            posts.forEach(p => p.setUserVoted(res.locals.user))
            comments.forEach(c => c.setUserVoted(res.locals.user))
        }

        // submissions = {
        //     {
        //         type:posts,
        //         {
        //             //the post itselt
        //         }
        //     },
        //     
        // }

        let submissions: any[] = []
        posts.forEach(p => submissions.push({ type: 'Post', ...p.toJSON() }));
        comments.forEach(c => submissions.push({ type: 'Comment', ...c.toJSON() }))

        submissions.sort((a: any, b: any) => {
            if (b.createdAt > a.createdAt) return 1;
            if (b.createdAt < a.createdAt) return -1;
            return 0;
        })

        return res.json({ user, submissions })





    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error in getting user submissions" })
    }

}

const router = Router();
router.get('/:username', allUsers, getUserSubmissions);

export default router;