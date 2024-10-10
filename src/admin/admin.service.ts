import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Import your TypeORM Admin entity
import { JwtService } from '@nestjs/jwt';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { LoginAdminDto } from './dto/login-participant.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminModel: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) { }

  async getTokens(admin: Admin) {
    const payload = {
      id: admin.id,
      is_active: admin.is_active,
      is_creator: admin.is_creator,
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
      accessToken,
      refreshToken,
    };
  }

  async findAll() {
    return this.adminModel.find();
  }

  async logout(refreshToken: string, res: Response) {
    try {
      const adminData = await this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_KEY,
      });

      if (!adminData) {
        throw new BadRequestException('Admin not verified');
      }

      const admin = await this.adminModel.findOne({
        where: { id: adminData.id },
      });

      if (!admin) {
        throw new BadRequestException('Admin not found');
      }

      admin.refreshToken = null;

      // Hash the refresh token (assuming you have a property `hashed_refresh_token` in your Admin entity)
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      admin.refreshToken = hashedRefreshToken;

      const updatedAdmin = await this.adminModel.save(admin);

      res.clearCookie('refresh_token');

      const response = {
        message: 'Admin logged out successfully',
      };

      return response;
    } catch (error) {
      throw new BadRequestException('Failed to logout');
    }
  }
  async create(createAdminDto: CreateAdminDto) {
    const { password, confirm_password } = createAdminDto;
    console.log(password);

    if (password !== confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    try {
      // Hash the admin's password
      const hashed_password = await bcrypt.hash(password, 7);

      // Create a new admin entity with the hashed password
      const newAdmin = this.adminModel.create({
        ...createAdminDto,
        password: hashed_password, // Use the hashed password
      });

      // Save the new admin entity to the database
      const savedAdmin = await this.adminModel.save(newAdmin);

      // Generate tokens for the new admin
      const tokens = await this.getTokens(savedAdmin);

      // Hash the refresh token
      const hashed_refresh_token = await bcrypt.hash(tokens.refreshToken, 7);

      // Update the admin's hashed_refresh_token property
      savedAdmin.refreshToken = hashed_refresh_token;

      // Save the updated admin entity to the database
      const updatedAdmin = await this.adminModel.save(savedAdmin);

      return { data: 'Admin created successfully', tokens: tokens };
    } catch (e) {
      return { error: e.message };
    }
  }

  async signIn(createAuthDto: LoginAdminDto, res: Response) {
    const admin = await this.adminModel.findOne({
      where: { name: createAuthDto.name },
    });
    if (!admin) {
      throw new BadRequestException('User does not exist');
    }

    const passwordMatch = await bcrypt.compare(
      createAuthDto.password,
      admin.password,
    );
    if (!passwordMatch) {
      throw new BadRequestException('Invalid password');
    }

    const tokens = await this.getTokens(admin);
    // Assuming you have an update method in your AdminService to update the refresh token
    await this.adminModel.update(admin.id, {
      refreshToken: tokens.refreshToken,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      maxAge: Number(process.env.COOKIE_TIME),
      httpOnly: true,
    });
    return { tokens, message: 'signed in' };
  }
}
