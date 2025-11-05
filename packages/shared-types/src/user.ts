import { z } from "zod";

// Login Schema
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
export type LoginInput = z.infer<typeof LoginSchema>;

// User DTO
export const UserDTO = z.object({
  id: z.string(),
  name: z.string(),
  passwordHash: z.string(),
  roleId: z.string(),
});
export type UserDTO = z.infer<typeof UserDTO>;
