import { PrismaClient } from ".prisma/backend-client";

declare global {
  // Verhindert doppelte Clients bei Hot Reload
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
