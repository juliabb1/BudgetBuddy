"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDTO = exports.CreateUserInput = exports.LoginSchema = void 0;
var zod_1 = require("zod");
// Login Schema
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
// Create User Input (for registration)
exports.CreateUserInput = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    passwordHash: zod_1.z.string(),
});
// User DTO (matching Prisma User model - includes userId)
exports.UserDTO = zod_1.z.object({
    userId: zod_1.z.string(),
    name: zod_1.z.string(),
    email: zod_1.z.string(),
    passwordHash: zod_1.z.string(),
});
