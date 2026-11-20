import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Medicine from "../../../models/Medicine";

function sanitizeAlternatives(raw) {
  let list = raw;
  if (typeof raw === "string" && raw.trim()) {
    try {
      list = JSON.parse(raw);
    } catch {
      list = raw.split(",").map((part) => ({ name: part.trim(), company: "" }));
    }
  }

  if (!Array.isArray(list)) return [];

  return list
    .map((item) => {
      if (typeof item === "string") {
        const s = item.trim();
        return s ? { name: s, company: "" } : null;
      }
      if (item && typeof item === "object") {
        const name = String(item?.name || item?.brandName || "").trim();
        const company = String(item?.company || item?.companyName || "").trim();
        if (!name && !company) return null;
        return { name, company };
      }
      return null;
    })
    .filter(Boolean);
}

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
      alternativeBrands: sanitizeAlternatives(
        body?.alternativeBrands ?? body?.alternativeBrand
      ),
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