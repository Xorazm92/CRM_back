import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto, LoginDto } from '../admin/dto/auth.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CustomJwtService } from 'src/infrastructure/lib/jwt/jwt.service';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt/bcrypt';
import { UserRole } from '../admin/dto/auth.dto';

type UserWithRole = {
  user_id: string;
  username: string;
  full_name: string | null;
  role: {
    role_name: UserRole;
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customJwtService: CustomJwtService,
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
    // Check if username already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Create role if it doesn't exist
    const role = await this.prisma.roles.upsert({
      where: { role_name: dto.role },
      update: {},
      create: {
        role_name: dto.role,
        role_level: this.getRoleLevel(dto.role),
      },
    });

    // Hash password
    const hashedPassword = await BcryptEncryption.hashPassword(dto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        full_name: dto.full_name,
        username: dto.username,
        password: hashedPassword,
        role_id: role.role_id,
      },
      include: {
        role: true,
      },
    });

    // Generate tokens
    const tokens = await this.customJwtService.generateTokens(user);

    return {
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        username: user.username,
        role: user.role.role_name,
      },
      tokens,
    };
  }

  async login(dto: LoginDto) {
    // Find user by username
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await BcryptEncryption.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.customJwtService.generateTokens(user);

    return {
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        username: user.username,
        role: user.role.role_name,
      },
      tokens,
    };
  }

  async refreshTokens(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.customJwtService.generateTokens(user);
  }
}
