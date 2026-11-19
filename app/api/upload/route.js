import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No valid file uploaded" },
        { status: 400 }
      );
    }

    const mimeType = String(file.type || "").toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only JPG, PNG, WEBP, or GIF images are allowed",
        },
        { status: 400 }
      );
    }

    if (typeof file.size === "number" && file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Image size must be 2MB or smaller",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Image size must be 2MB or smaller",
        },
        { status: 400 }
      );
    }

    const base64 = Buffer.from(bytes).toString("base64");
    const imageUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ success: true, imageUrl }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}