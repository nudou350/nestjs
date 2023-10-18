import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDTO } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(private prismaService : PrismaService, private jwt : JwtService, private config : ConfigService) { }
    
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
        return this.signToken(user.id, user.email)
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

    async signIn(dto:AuthDTO){
        const user = await this.prismaService.user.findUnique({
            where:{
                email: dto.email
            }
        })
        if(!user) throw new ForbiddenException('Wrong credentials')
        const pwMatches = await argon.verify(user.hash, dto.password)
        if(!pwMatches) throw new ForbiddenException('Wrong credentials')
        return this.signToken(user.id, user.email)
    }

    async signToken(userId: number, email : string): Promise<{access_token : string}>{
        const payload = {
            sub : userId,
            email
        }
        const secret = this.config.get('JWT_SECRET')
        const token = await this.jwt.signAsync(payload, {expiresIn:'7d', secret: secret})
        return {
            access_token : token
        }
    }
}