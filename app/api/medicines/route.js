import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Medicine from "../../../models/Medicine";

export async function GET() {
  try {
    await dbConnect();
    const medicines = await Medicine.find({}).sort({ createdAt: -1 });
    return NextResponse.json(
      { success: true, data: medicines },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/medicines error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch medicines" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const name = String(body?.name || "").trim();
    const company = String(body?.company || "").trim();

    if (!name || !company) {
      return NextResponse.json(
        { success: false, error: "Medicine name and company are required" },
        { status: 400 }
      );
    }

    const newMedicine = await Medicine.create({
      name,
      company,
      image: String(body?.image || "").trim(),
      unitPrice: String(body?.unitPrice ?? "").trim(),
      stripPrice: String(body?.stripPrice ?? "").trim(),
      boxPrice: String(body?.boxPrice ?? "").trim(),
      uses: String(body?.uses || "").trim(),
      dosage: String(body?.dosage || "").trim(),
      sideEffects: String(body?.sideEffects || "").trim(),
    });

    return NextResponse.json(
      { success: true, data: newMedicine },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/medicines error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save medicine" },
      { status: 500 }
    );
  }
}