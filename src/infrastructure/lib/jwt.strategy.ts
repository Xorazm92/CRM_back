import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: payload.id },
      select: {
        user_id: true,
        username: true,
        role: true
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    // DEBUG LOG
    console.log('JwtStrategy.validate', { payload, user });

    // Always return user object with 'role' as string and both lower/upper case
    return {
      user_id: user.user_id,
      username: user.username,
      role: typeof user.role === 'string' ? user.role : String(user.role),
    };
  }
}