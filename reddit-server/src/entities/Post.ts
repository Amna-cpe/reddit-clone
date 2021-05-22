import { AfterLoad, BeforeInsert, Column, Entity as TOEntity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm"
import User from "./User"
import Entity from "./Entity";
import { makeid, slugify } from "../utill/helperFunctions";
import Sub from "./Sub";
import Comment from "./Comment";
import { Exclude, Expose } from "class-transformer";
import Vote from "./Vote";

@TOEntity('posts')
export default class Post extends Entity {

    constructor(post: Partial<Post>) {
        super()
        Object.assign(this, post)
    }

    @Index()
    @Column()
    identifier: string //7 char Id

    @Column()
    title: string

    @Index()
    @Column()
    slug: string  // basically the title of the post with _ in between

    @Column({ nullable: true, type: 'text' })
    body: string

    @Column()
    subName: string //reactjs

    //MAYBE YOU SHOOULD ADD USERNAME? OR REMOVE THE JOIN COLUMN WIHT USERNAME THING
    @Column()
    username: string

    @ManyToOne(() => User, user => user.posts)
    @JoinColumn({ name: 'username', referencedColumnName: 'username' })
    user: User;

    @ManyToOne(() => Sub, sub => sub.posts)
    @JoinColumn({ name: 'subName', referencedColumnName: 'name' })
    sub: Sub;

    // it is not this table that holds the foriesn key
    // tha is why we need a inverse function
    @Exclude()
    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[]

    @Expose() get commentCount(): number {
        return this.comments?.length
    }

    @BeforeInsert()
    makeIdandSlug() {
        this.identifier = makeid(7);
        this.slug = slugify(this.title);
    }

    @Expose() get url(): string {
        return `/r/${this.subName}/${this.identifier}/${this.slug}`
    }


    @OneToMany(() => Vote, vote => vote.post)
    votes: Vote[]

    @Expose() get voteCount(): number {
        return this.votes?.reduce((prev, curr) => prev + (curr.value || 0), 0);
    }

    // protected url: string
    // @AfterLoad()
    // createFields() {
    //     this.url = `/r/${this.subName}/${this.identifier}/${this.slug}`
    // }

    protected userVoted: number
    setUserVoted(user:User) {
        // find the index of the vote related to the user and return the value
        const index = this.votes.findIndex(v => v.username === user.username)
        this.userVoted = index > -1 ? this.votes[index].value : 0;
    }


}