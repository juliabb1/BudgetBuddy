import { Injectable, Logger } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private logger = new Logger('UserService');

  async getUser(
    UserWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    this.logger.log('getUserById');
    return this.prisma.user.findUnique({
      where: UserWhereUniqueInput,
    });
  }

  async createUser(user: Prisma.UserCreateInput): Promise<User> {
    this.logger.log('createUser');
    return this.prisma.user.create({ data: user });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    this.logger.log('updateUser');
    return this.prisma.user.update({
      data: params.data,
      where: params.where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    this.logger.log('deleteUser');
    return this.prisma.user.delete({
      where,
    });
  }
}
