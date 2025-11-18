import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import { UserDTO } from '@repo/shared-types/user';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUser({
      userId: id,
    });

    if (user !== null) {
      return user;
    }
    return 'User not found';
  }

  @Post()
  createUser(@Body() user: UserDTO & { email: string }): Promise<UserModel> {
    return this.userService.createUser({
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
    });
  }

  @Put(':id')
  updateUser(
    @Param('id') id: string,
    @Body() user: UserDTO,
  ): Promise<UserModel> {
    return this.userService.updateUser({
      where: { userId: id },
      data: {
        name: user.name,
        passwordHash: user.passwordHash,
      },
    });
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string): Promise<UserModel> {
    return this.userService.deleteUser({ userId: id });
  }
}
