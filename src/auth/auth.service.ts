import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDTO } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService {
    constructor(private prismaService : PrismaService) { }
    async signUp(dto : AuthDTO){
        try{
                    //generate password hash
        const hash: string = await argon.hash(dto.password)
        //save user in prisma db
        const user = await this.prismaService.user.create({
            data:{
                email: dto.email,
                hash
            },
            select:{
                id: true,
                email: true,
                createdAt: true
            },
        })
        return user
        }
        catch(err){
           if(err instanceof PrismaClientKnownRequestError){
                if(err.code === 'P2002'){
                     throw new ForbiddenException('Email already exists')
                }
                else{
                    throw new ForbiddenException('Something went wrong')
                }
           }
        }
    }

    signIn(){
        return {msg: 'i signed in'}
    }
}