import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { SignInAdminDto } from './dto/signin-admin.dto';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt/bcrypt';
import { CustomJwtService } from 'src/infrastructure/lib/custom-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { AddMemberDto } from './dto/add-memberdto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwt: CustomJwtService,
    private readonly configService: ConfigService,
  ) {}

  //! SIGNIN ADMIN
  async signin(signinAdminDto: SignInAdminDto) {
    const currentAdmin = await this.prismaService.user.findUnique({
      where: { username: signinAdminDto.username },
    });
    if (!currentAdmin) {
      throw new BadRequestException('Username or password invalid');
    }
    const isMatchPassword = await BcryptEncryption.compare(
      signinAdminDto.password,
      currentAdmin.password,
    );
    if (!isMatchPassword) {
      throw new BadRequestException('Username or password invalid');
    }
    const payload = {
      id: currentAdmin.user_id,
      sub: currentAdmin.username,
      role: currentAdmin.role,
    };
    const accessToken = await this.jwt.generateAccessToken(payload);
    const refreshToken = await this.jwt.generateRefreshToken(payload);
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
  //! CREATE ADMIN
  async create(createAdminDto: CreateAdminDto) {
    const currentAdmin = await this.prismaService.user.findUnique({
      where: { username: createAdminDto.username },
    });
    if (currentAdmin) {
      throw new ConflictException('A user with this username already exists');
    }
    createAdminDto.password = await BcryptEncryption.encrypt(
      createAdminDto.password,
    );
    const admin = await this.prismaService.user.create({
      data: { ...createAdminDto, role: UserRole.ADMIN },
    });
    return {
      status: HttpStatus.CREATED,
      message: 'created',
      data: admin,
    };
  }

  //! ADD Member TO GROUP
  async addMemberToGroup(addMemberDto: AddMemberDto) {
    const currentMember = await this.prismaService.user.findUnique({
      where: {
        user_id: addMemberDto.user_id,
      },
    });
    if (!currentMember) {
      throw new NotFoundException(
        `Member with id ${addMemberDto.user_id} not found.`,
      );
    }
    const currentGroup = await this.prismaService.groups.findUnique({
      where: { group_id: addMemberDto.group_id },
    });
    if (!currentGroup) {
      throw new NotFoundException(
        `Group with id ${addMemberDto.group_id} not found.`,
      );
    }
    await this.prismaService.groupMembers.create({
      data: addMemberDto,
    });
    return {
      status: HttpStatus.OK,
      message: 'success',
    };
  }

  //! FIND ALL ADMIN
  async findAll() {
    const admins = await this.prismaService.user.findMany({
      where: {
        role: 'ADMIN',
      },
    });
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: admins,
    };
  }

  //!FIND ADMIN BY ID
  async findOne(id: string) {
    const admin = await this.prismaService.user.findUnique({
      where: {
        user_id: id,
        role: 'ADMIN',
      },
    });
    if (!admin) {
      throw new NotFoundException(`Admin with id ${id} not found.`);
    }
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: admin,
    };
  }

  //! EDIT PROFILE ADMIN
  async update(id: string, updateAdminDto: UpdateAdminDto) {
    const currentAdmin = await this.prismaService.user.findUnique({
      where: {
        user_id: id,
        role: 'ADMIN',
      },
    });
    if (!currentAdmin) {
      throw new NotFoundException(`Admin with id ${id} not found.`);
    }
    await this.prismaService.user.update({
      where: { user_id: id },
      data: { full_name: updateAdminDto.full_name },
    });
    return {
      status: HttpStatus.OK,
      message: 'success',
    };
  }

  //! DELETE ADMIN BY ID
  async remove(id: string) {
    const currentAdmin = await this.prismaService.user.findUnique({
      where: {
        user_id: id,
        role: 'ADMIN',
      },
    });
    if (!currentAdmin) {
      throw new NotFoundException(`Admin with id ${id} not found.`);
    }
    await this.prismaService.user.delete({ where: { user_id: id } });
    return {
      status: HttpStatus.OK,
      message: 'success',
    };
  }
}
