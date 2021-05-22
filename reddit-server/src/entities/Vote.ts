import {   Column, Entity as TOEntity, Index, JoinColumn,  ManyToOne} from "typeorm"
import User from "./User"
import Entity from "./Entity";
import Post from "./Post";
import Comment from "./Comment";


@TOEntity('votes')
export default class Vote extends Entity {

    constructor(vote: Partial<Vote>) {
        super()
        Object.assign(this, vote)
    }

    @Column()
    value:number

    // foreign key-->username
    @ManyToOne(()=>User)
    @JoinColumn({name:'username',referencedColumnName:'username'})
    user:User

    @Column()
    username:string

     // foreign key --> postId
     @ManyToOne(()=>Post)
     post:Post

      // foreign key --> commentId
      @ManyToOne(()=>Comment)
      comment:Comment



  


}