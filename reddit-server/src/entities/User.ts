import { Entity as TOEntity,  Column,  Index,  BeforeInsert, OneToMany } from "typeorm";
import { IsEmail, Length } from 'class-validator'
import bcrypt from "bcrypt"
import {  Exclude } from 'class-transformer'

import Entity from './Entity'
import Post from "./Post";

@TOEntity("users")
export default class User extends Entity {


    constructor(user: Partial<User>) {
        super()
        Object.assign(this, user)
    }


    @Index()
    @IsEmail()
    @Column()
    email: string

    @Index()
    @Length(3)
    @Column()   
    username: string

    @Exclude()
    @Column()
    @Length(6)
    password: string  

    @OneToMany(()=> Post, post=>post)
    posts:Post[];

    @BeforeInsert()
    async hashPass() {
        this.password = await bcrypt.hash(this.password, 6)
    }





}
