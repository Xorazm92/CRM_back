import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto, LoginDto } from '../admin/dto/auth.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt/bcrypt';
import { UserRole as PrismaUserRole } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { ConfirmPasswordDto } from './dto/confirm-password.dto';
import { CustomJwtService } from 'src/infrastructure/lib/custom-jwt.service';
import { UserRole } from 'src/users/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customJwtService: CustomJwtService,
    private readonly configService: ConfigService,
  ) {}

  private getRoleLevel(role: UserRole): number {
    switch (role) {
      case UserRole.ADMIN:
        return 1;
      case UserRole.MANAGER:
        return 2;
      case UserRole.TEACHER:
        return 3;
      case UserRole.STUDENT:
        return 4;
      default:
        return 4;
    }
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    dto.password = await BcryptEncryption.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        role: dto.role as PrismaUserRole
      }
    });

    return {
      status: HttpStatus.CREATED,
      message: 'created',
      data: user,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      select: {
        user_id: true,
        username: true,
        password: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    });
    console.log(dto.username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await BcryptEncryption.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      id: user.user_id.toString(), 
      sub: user.user_id.toString(),
      role: user.role as UserRole, 
    };
    const accessToken =
      await this.customJwtService.generateAccessToken(payload);
    const refreshToken =
      await this.customJwtService.generateRefreshToken(payload);
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: {
        accessToken,
        access_token_expire:
          this.configService.get<string>('ACCESS_TOKEN_TIME'),
        refreshToken,
        refresh_token_expire:
          this.configService.get<string>('REFRESH_TOKEN_TIME'),
      },
    };
  }

  async confirmPassword(id: string, confirmPasswordDto: ConfirmPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { user_id: id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }
    const isMatchPassword = await BcryptEncryption.compare(
      confirmPasswordDto.old_password,
      user.password,
    );
    if (!isMatchPassword) {
      throw new BadRequestException('Old Password invalid');
    }
    const newPassword = await BcryptEncryption.encrypt(
      confirmPasswordDto.new_password,
    );
    await this.prisma.user.update({
      where: { user_id: id },
      data: { password: newPassword },
    });
    return {
      status: HttpStatus.OK,
      message: 'success',
    };
  }

  async refreshTokens(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const payload = {
      id: user.user_id,
      sub: user.username,
      role: user.role as unknown as UserRole,
    };
    const accessToken =
      await this.customJwtService.generateAccessToken(payload);
    const refreshToken =
      await this.customJwtService.generateRefreshToken(payload);
    return { accessToken, refreshToken };
  }
}
