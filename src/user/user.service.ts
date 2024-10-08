import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { SignUpAuthDto } from "src/auth/dto";
import { UserRepository } from "./repository/user.repository";



@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) { }

  async create(signUpDto: SignUpAuthDto): Promise<Omit<User, 'password'>> {
    const user = this.userRepository.create(signUpDto)

    return user
  }


  async findAll(take: string, skip: string): Promise<User[]> {
    return this.userRepository.findAll(take, skip)
  }

  findOne(id: number) {
    return this.userRepository.findOne(id)
  }


  findByEmail(email: string) {
    return this.userRepository.findByEmail(email)
  }


}
