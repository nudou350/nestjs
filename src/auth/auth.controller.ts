import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthDTO } from "./dto";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController{
    constructor(private authService : AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('signup')
    signUp(@Body() dto : AuthDTO){
       return this.authService.signUp(dto)
    }
  @HttpCode(HttpStatus.OK)
    @Post('signin')
    signIn(@Body() dto : AuthDTO){
        return this.authService.signIn(dto)
    }
}