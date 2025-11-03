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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  getUser(@Param('id') id: string): UserDTO {
    return this.userService.getUser(id);
  }

  @Post()
  createUser(@Body() user: Partial<UserDTO>): Partial<UserDTO> {
    return this.userService.createUser(user);
  }

  @Put(':id')
  updateUser(
    @Param('id') id: string,
    @Body() user: Partial<UserDTO>,
  ): Partial<UserDTO> {
    return this.userService.updateUser(id, user);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string): string {
    return this.userService.deleteUser(id);
  }
}
