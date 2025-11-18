import prisma from "@web/lib/prisma";
import bcrypt from "bcryptjs";
import type { NextApiRequest, NextApiResponse } from "next";

// Disable body parsing, we'll handle it manually if needed
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Log incoming request for debugging
    console.log("Register request body:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);

    // Ensure body is parsed
    const body = req.body;
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        message: "Request body is empty or not properly formatted",
      });
    }

    const { name, email, password } = body;

    // Validate that all fields are present and not empty
    if (!name || !email || !password) {
      console.log("Validation failed - missing fields:", {
        name: !!name,
        email: !!email,
        password: !!password,
      });
      return res.status(400).json({ message: "Alle Felder sind erforderlich" });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Ungültige E-Mail-Adresse" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User existiert bereits" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    return res.status(201).json({ user });
  } catch (error: unknown) {
    console.error("Register error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ message: errorMessage });
  }
}
