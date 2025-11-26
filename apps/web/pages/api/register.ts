import bcrypt from "bcryptjs";
import type { NextApiRequest, NextApiResponse } from "next";

const backendUrl =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;

if (!backendUrl) {
  console.warn(
    "REGISTER_API: BACKEND_URL or NEXT_PUBLIC_BACKEND_URL is not defined."
  );
}

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

  if (!backendUrl) {
    return res
      .status(500)
      .json({ message: "BACKEND_URL is not configured on the server." });
  }

  try {
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

    const passwordHash = await bcrypt.hash(password, 10);

    console.log(`[REGISTER] Calling backend at: ${backendUrl}/user`);
    const backendResponse = await fetch(`${backendUrl}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, passwordHash }),
    });
    console.log(
      `[REGISTER] Backend response status: ${backendResponse.status}`
    );

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.json().catch(() => null);
      const message =
        (errorBody && (errorBody.message || errorBody.error)) ||
        "Fehler im Backend";
      return res.status(backendResponse.status).json({ message });
    }

    const user = await backendResponse.json();
    return res.status(201).json({ user });
  } catch (error: unknown) {
    console.error("Register error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ message: errorMessage });
  }
}
