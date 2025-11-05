import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO } from '@repo/shared-types/user';
import { User, User as UserModel } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    const user = this.userService.getUser({
      id: id,
    });

    if (user !== null) {
      return user;
    }
    return 'User not found';
  }

  @Post()
  createUser(@Body() user: UserDTO): Promise<UserModel> {
    return this.userService.createUser({
      id: user.id,
      name: user.name,
      passwordHash: user.passwordHash,
      Role: { connect: { id: user.roleId } },
    });
  }

  @Put(':id')
  updateUser(
    @Param('id') id: string,
    @Body() user: UserDTO,
  ): Promise<UserModel> {
    return this.userService.updateUser({
      where: { id: id },
      data: {
        name: user.name,
        passwordHash: user.passwordHash,
        Role: { connect: { id: user.roleId } },
      },
    });
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string): Promise<UserModel> {
    return this.userService.deleteUser({ id: id });
  }
}
