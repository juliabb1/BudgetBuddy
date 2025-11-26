import { z } from "zod";

// Login Schema
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// Create User Input (for registration)
export const CreateUserInput = z.object({
  name: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
});
export type CreateUserInput = z.infer<typeof CreateUserInput>;

// User DTO (matching Prisma User model - includes userId)
export const UserDTO = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  passwordHash: z.string(),
});
export type UserDTO = z.infer<typeof UserDTO>;
