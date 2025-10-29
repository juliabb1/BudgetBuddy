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
  email: z.string().email(),
  name: z.string().nullable().optional()
});
export type UserDTO = z.infer<typeof UserDTO>;
