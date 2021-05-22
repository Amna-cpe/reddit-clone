import { BeforeInsert, Column, Entity as TOEntity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm"
import User from "./User"
import Entity from "./Entity";
import { makeid } from "../utill/helperFunctions";
import Post from "./Post";
import Vote from "./Vote";
import { Expose } from "class-transformer";


@TOEntity('comments')
export default class Comment extends Entity {

    constructor(Comment: Partial<Comment>) {
        super()
        Object.assign(this, Comment)
    }

    @Index()
    @Column()
    identifier: string


    @Column()
    body: string

    @Column()
    username: string


    // why we remore the funtc?
    // cuz we don not have a place where we only
    // get the comments of the user
    @ManyToOne(() => User)
    @JoinColumn({ name: 'username', referencedColumnName: 'username' })
    user: User;

    // we need to get the comments of the post
    @ManyToOne(() => Post, post => post.comments, { nullable: false })
    post: Post;

    @OneToMany(() => Vote, vote => vote.comment)
    votes: Vote[]

    @BeforeInsert()
    makeIdandSlug() {
        this.identifier = makeid(8);

    }

    @Expose() get voteCount(): number {
        return this.votes?.reduce((prev, curr) => prev + (curr.value || 0), 0);
    }

    protected userVoted: number
    setUserVoted(user:User) {
        // find the index of the vote related to the user and return the value
        const index = this.votes?.findIndex(v => v.username === user.username)
        this.userVoted = index > -1 ? this.votes[index].value : 0;
    }

}