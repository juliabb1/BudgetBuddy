import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const backendUrl =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;

if (!backendUrl) {
  console.warn(
    "REGISTER_API: BACKEND_URL or NEXT_PUBLIC_BACKEND_URL is not defined."
  );
}

export async function POST(req: NextRequest) {
  if (!backendUrl) {
    return NextResponse.json(
      { message: "BACKEND_URL is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { message: "Request body is empty or not properly formatted" },
        { status: 400 }
      );
    }

    const { name, email, password } = body;

    // Validate that all fields are present and not empty
    if (!name || !email || !password) {
      console.log("Validation failed - missing fields:", {
        name: !!name,
        email: !!email,
        password: !!password,
      });
      return NextResponse.json(
        { message: "Alle Felder sind erforderlich" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Ungültige E-Mail-Adresse" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const backendResponse = await fetch(`${backendUrl}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, passwordHash }),
    });

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.json().catch(() => null);
      const message =
        (errorBody && (errorBody.message || errorBody.error)) ||
        "Fehler im Backend";
      return NextResponse.json({ message }, { status: backendResponse.status });
    }

    const user = await backendResponse.json();
    return NextResponse.json({ user }, { status: 201 });
  } catch (error: unknown) {
    console.error("Register error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
