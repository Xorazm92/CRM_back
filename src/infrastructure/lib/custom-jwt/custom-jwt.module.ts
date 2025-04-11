

import { Module } from '@nestjs/common';


import { JwtService } from '@nestjs/jwt';


import { ConfigService } from '@nestjs/config';

import { CustomJwtService } from './custom-jwt.service';



@Module({


  providers: [CustomJwtService, JwtService, ConfigService],


  exports: [CustomJwtService], // Export CustomJwtService for use in other modules


})

export class CustomJwtModule { }