import console from "console";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts/me`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader, // forward the token
        },
      }
    );

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("Error fetching contracts via BFF", err);
    return NextResponse.json(
      { message: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}
