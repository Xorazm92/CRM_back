import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { LoginUserDto } from '../user/dto/login-user.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async getTokens(user: User) {
    const payload = {
      id: user.id,
      is_active: user.is_active,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
  async create(createUserDto: CreateUserDto, res: Response) {
    console.log({ createUserDto })
    if (!createUserDto || !createUserDto.password) {
      throw new BadRequestException('Password is required');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already registered');
    }

    const existingUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUsername) {
      throw new BadRequestException('Username already taken');
    }

    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(createUserDto.password, salt);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashed_password,
    });

    await this.userRepository.save(newUser);

    const tokens = await this.getTokens(newUser);
    const hashed_refresh_token = await bcrypt.hash(tokens.refreshToken, salt);

    newUser.refreshToken = hashed_refresh_token;
    await this.userRepository.save(newUser);

    res.cookie('refresh_token', tokens.refreshToken, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(201).json({
      message: 'Registration successful',
      user: newUser,
      tokens,
    });
  }


  async findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (e) {
      return { error: e.message };
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      await this.userRepository.update({ id }, updateUserDto);
      return this.findOne(id);
    } catch (e) {
      return { error: e.message };
    }
  }

  async remove(id: number) {
    const userToRemove = await this.findOne(id);
    if ('error' in userToRemove) {
      // User not found, return the error
      return userToRemove;
    }
    return this.userRepository.remove([userToRemove]);
  }

  async login(loginUserDto: LoginUserDto, res: Response) {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user);
    const hashed_refresh_token = await bcrypt.hash(tokens.refreshToken, 7);

    user.refreshToken = hashed_refresh_token;
    await this.userRepository.save(user);

    res.cookie('refresh_token', tokens.refreshToken, {
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
      httpOnly: true,
    });

    return {
      status: 200,
      data: {
        message: 'Login successful',
        user: user,
        tokens: tokens,
      },
    };
  }
  async logout(refreshToken: string, res: Response) {
    try {
      const userData = await this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_KEY,
      });

      if (!userData) {
        throw new BadRequestException('User is not verified');
      }

      const user = await this.userRepository.findOne({
        where: { id: userData.id },
      });

      if (!user) {
        throw new BadRequestException('user not found');
      }

      user.refreshToken = null;

      // Hash the refresh token (assuming you have a property `hashed_refresh_token` in your user entity)
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      user.refreshToken = hashedRefreshToken;

      await this.userRepository.save(user);

      res.clearCookie('refresh_token');

      const response = {
        message: 'user logged out successfully',
      };

      return response;
    } catch (error) {
      throw new BadRequestException('Failed to logout');
    }
  }
}
