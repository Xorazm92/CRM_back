import { Injectable, ExecutionContext, CanActivate, UnauthorizedException } from '@nestjs/common';


import { Reflector } from '@nestjs/core';


import { CustomJwtService } from '../lib/custom-jwt/custom-jwt.service';



@Injectable()


export class JwtAuthGuard implements CanActivate {


  constructor(


    private readonly reflector: Reflector,


    private readonly jwt: CustomJwtService, // Ensure this is correctly injected


  ) {}





  async canActivate(context: ExecutionContext): Promise<boolean> {


    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());


    if (isPublic) {


      return true;


    }


    const req = context.switchToHttp().getRequest();


    const auth = req.headers.authorization;


    if (!auth) {


      throw new UnauthorizedException('Token not found');


    }


    const bearer = auth.split(' ')[0];


    const token = auth.split(' ')[1];


    if (bearer !== 'Bearer' || !token) {


      throw new UnauthorizedException('Unauthorized');


    }


    try {


      const user = await this.jwt.verifyAccessToken(token);


      req.user = user;


      return true;


    } catch (error) {


      throw new UnauthorizedException('Token expired');


    }

  }


}