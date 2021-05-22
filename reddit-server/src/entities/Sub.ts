import { Column, Entity as TOEntity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm"
import User from "./User"
import Entity from "./Entity";
import Post from "./Post";
import { Expose } from "class-transformer";

@TOEntity('subs')
export default class Sub extends Entity {

    constructor(sub: Partial<Sub>) {
        super()
        Object.assign(this, sub)
    }


    @Index()
    @Column()
    name: string


    @Column()
    title: string


    @Column({ type: "text", nullable: true })
    description: string

    @Column({ nullable: true })
    imageUrn: string

    @Column({ nullable: true })
    bannerUrn: string

    @Column()
    username: string

    //  ----the jpoin columns ----
    // the NAME:Join columns are always a reference to some other columns (using a foreign key).
    // By default your relation always refers to the primary 
    //column of the related entity. If you want to create relation with o
    //ther columns of the related entity - you can specify them in

    @ManyToOne(() => User)
    @JoinColumn({ name: 'username', referencedColumnName: 'username' })
    user: User;

    @OneToMany(() => Post, post => post.sub)
    posts: Post[]

    @Expose()
    get imageUrl(): string {
        return this.imageUrn ? `${process.env.APP_URL}/images/${this.imageUrn}` :
            'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=retro&f=y'
    }

    @Expose()
    get bannerUrl(): string | undefined {
        return this.bannerUrn ? `${process.env.APP_URL}/images/${this.bannerUrn}` :
            undefined
    }




}