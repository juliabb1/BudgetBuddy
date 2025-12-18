import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CreateUserInput, LoginInput, UserDTO } from '@repo/shared-types/user';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  private readonly logger = new Logger(UserController.name);

  // @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: string) {
    this.logger.log(`Fetching user with ID: ${id}`);

    const user = await this.userService.getUser({
      userId: id,
    });

    if (user !== null) {
      return user;
    }
    return 'User not found';
  }

  @Post('login')
  async login(@Body() loginData: LoginInput) {
    const { email, password } = loginData;

    const user = await this.userService.getUser({
      email: email,
    });

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return this.authService.login(user);
  }

  @Post()
  async createUser(@Body() user: CreateUserInput): Promise<UserModel> {
    try {
      return await this.userService.createUser({
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as any).code === 'P2002'
      ) {
        // Prisma unique constraint violation error
        this.logger.error('User creation failed - email already exists', error);
        throw new HttpException('User mit dieser Mail existiert bereits.', 400);
      }
      // Re-throw other errors
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: string): Promise<UserModel> {
    return this.userService.deleteUser({ userId: id });
  }
}
