import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from "bcrypt"
import { SignInAuthDto, SignUpAuthDto, UpdateUserDto } from './dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {

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

  async signUp(singUpAuthDto: SignUpAuthDto, res: Response) {
    console.log({ singUpAuthDto })


    const existingUser = await this.userRepository.findOne({
      where: { email: singUpAuthDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already registered');
    }

    const existingUsername = await this.userRepository.findOne({
      where: { username: singUpAuthDto.username },
    });

    if (existingUsername) {
      throw new BadRequestException('Username already taken');
    }

    console.log({ singUpAuthDto })
    const salt = await bcrypt.genSalt(10)

    const hashed_password = await bcrypt.hash(singUpAuthDto.password, salt);
    const newUser = this.userRepository.create({
      ...singUpAuthDto,
      password: hashed_password,
    });

    await this.userRepository.save(newUser);

    const tokens = await this.getTokens(newUser);
    const hashed_refresh_token = await bcrypt.hash(tokens.refreshToken, 7);

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

  async signIn(signInAuthDto: SignInAuthDto, res: Response) {
    const user = await this.userRepository.findOne({
      where: { email: signInAuthDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      signInAuthDto.password,
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
