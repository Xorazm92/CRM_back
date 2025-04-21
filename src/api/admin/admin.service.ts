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
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/users/user-role.enum';
import { AddMemberDto } from './dto/add-memberdto';
import { CustomJwtService } from 'src/infrastructure/lib/custom-jwt.service';
import { AddTeacherToGroupDto } from './dto/add-teacher-to-group.dto';

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
      sub: currentAdmin.username,
      role: UserRole[currentAdmin.role],
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
      data: { ...createAdminDto, role: 'ADMIN' },
    });
    return {
      status: HttpStatus.CREATED,
      message: 'created',
      data: admin,
    };
  }

  //! GET ADMIN PROFILE
  async getProfile(id: string) {
    const admin = await this.prismaService.user.findUnique({
      where: { user_id: id, role: 'ADMIN' },
      select: { user_id: true, name: true, lastname: true, username: true, role: true },
    });
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: admin,
    };
  }

  /**
   * Guruhga bir nechta a'zo qo'shish (student yoki teacher)
   */
  async addMemberToGroup(dto: AddMemberDto) {
    if (!dto.user_ids || !dto.group_id) {
      throw new BadRequestException('user_ids va group_id majburiy!');
    }
    // Guruhni tekshirish
    const group = await this.prismaService.groups.findUnique({ where: { group_id: dto.group_id } });
    if (!group) throw new NotFoundException(`Group with id ${dto.group_id} not found.`);

    const results = [];
    for (const user_id of dto.user_ids) {
      if (!user_id) {
        results.push({ user_id, status: 'user_id_undefined' });
        continue;
      }
      const user = await this.prismaService.user.findUnique({ where: { user_id } });
      if (!user) {
        results.push({ user_id, status: 'not_found' });
        continue;
      }
      const exists = await this.prismaService.groupMembers.findFirst({
        where: { user_id, group_id: dto.group_id }
      });
      if (exists) {
        results.push({ user_id, status: 'already_in_group' });
        continue;
      }
      await this.prismaService.groupMembers.create({
        data: { user_id, group_id: dto.group_id }
      });
      results.push({ user_id, status: 'added' });
    }
    return { status: 200, message: 'done', results };
  }

  //! FIND ALL ADMIN
  async findAll(page: number, limit: number) {
    page = (page - 1) * limit;
    const admins = await this.prismaService.user.findMany({
      where: {
        role: 'ADMIN',
      },
      skip: page,
      take: limit,
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
      data: { name: updateAdminDto.name, lastname: updateAdminDto.lastname },
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

  /**
   * Guruhga teacher qo'shish
   */
  async addTeacherToGroup(dto: AddTeacherToGroupDto) {
    if (!dto.teacher_id || !dto.group_id) {
      throw new BadRequestException('teacher_id va group_id majburiy!');
    }
    // Guruhni tekshirish
    const group = await this.prismaService.groups.findUnique({ where: { group_id: dto.group_id } });
    if (!group) throw new NotFoundException(`Group with id ${dto.group_id} not found.`);
    // Teacher mavjudligini tekshirish
    const teacher = await this.prismaService.user.findUnique({ where: { user_id: dto.teacher_id } });
    if (!teacher) throw new NotFoundException(`Teacher with id ${dto.teacher_id} not found.`);
    // Guruhga biriktirish (masalan, Groups modelida teacher_id ni update qilish)
    await this.prismaService.groups.update({
      where: { group_id: dto.group_id },
      data: { teacher_id: dto.teacher_id }
    });
    return { status: 200, message: 'success' };
  }

  // GROUPNI ID BO'YICHA TO'LIQ MA'LUMOTLAR BILAN QAYTARISH
  async findGroupById(id: string) {
    const group = await this.prismaService.groups.findUnique({
      where: { group_id: id },
      include: {
        teacher: true,
        course: true,
        group_members: {
          include: {
            user: true
          }
        },
        lessons: true,
        schedules: true,
        assignments: true,
        students: true
      }
    });
    if (!group) {
      throw new NotFoundException(`Group with id ${id} not found.`);
    }
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: group,
    };
  }
}
