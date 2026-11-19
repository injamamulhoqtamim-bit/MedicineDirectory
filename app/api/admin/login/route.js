import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email ebong password proyojon!" },
        { status: 400 }
      );
    }

    const adminEmail = String(process.env.ADMIN_EMAIL || "")
      .trim()
      .toLowerCase();
    const adminPassword = String(process.env.ADMIN_PASSWORD || "").trim();

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, error: "Server admin credentials are not configured" },
        { status: 500 }
      );
    }

    const isEmailValid = email === adminEmail;
    const isPasswordValid = password === adminPassword;

    if (!isEmailValid || !isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: !isEmailValid
            ? "Admin email vul hoyeche!"
            : "Password vul hoyeche!",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 }
    );

    response.cookies.set("admin_auth", "authenticated", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("POST /api/admin/login error:", error);
    return NextResponse.json(
      { success: false, error: "Login request failed" },
      { status: 500 }
    );
  }
}