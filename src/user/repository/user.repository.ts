import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from "src/prisma/prisma.service";



@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(createUserDto: Prisma.UserCreateInput): Promise<Omit<User, 'password'>> {
    try {
      const { password, ...user } = await this.prisma.user.create({
        data: createUserDto
      })
      return user
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(error.code)
        throw new ConflictException()
      }
      throw new InternalServerErrorException()
    }
  }


  async findAll(take: string, skip: string): Promise<User[]> {

    const query = {
      skip: (+skip - 1) * +take,
      take: +take
    }

    console.log(query)
    return this.prisma.user.findMany(query)
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email
      }
    })
  }
}
