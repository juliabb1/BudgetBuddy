import { Injectable } from '@nestjs/common';
import { UserDTO } from '@repo/shared-types/user';

@Injectable()
export class UserService {
  getUser(id: string): UserDTO {
    return { id, name: 'John Doe', email: '' };
  }

  createUser(user: Partial<UserDTO>): UserDTO {
    return { id: '1', ...user } as UserDTO;
  }

  updateUser(id: string, user: Partial<UserDTO>): UserDTO {
    return { id, ...user } as UserDTO;
  }

  deleteUser(id: string): string {
    return `User with id ${id} deleted`;
  }
}
