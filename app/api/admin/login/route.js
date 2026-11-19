import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    const adminEmail = String(process.env.ADMIN_EMAIL || "")
      .trim()
      .toLowerCase();
    const adminPassword = String(process.env.ADMIN_PASSWORD || "");

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, error: "Server admin credentials are not configured" },
        { status: 500 }
      );
    }

    if (email === adminEmail && password === adminPassword) {
      return NextResponse.json(
        { success: true, message: "Login successful" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Email ba password vul hoyeche!" },
      { status: 401 }
    );
  } catch (error) {
    console.error("POST /api/admin/login error:", error);
    return NextResponse.json(
      { success: false, error: "Login request failed" },
      { status: 500 }
    );
  }
}