import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "../../../../lib/mongodb";
import Medicine from "../../../../models/Medicine";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id || ""));
}

export async function PUT(request, context) {
  try {
    await dbConnect();
    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid medicine ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updateFields = {};
    if (body?.name !== undefined) {
      const trimmedName = String(body.name || "").trim();
      if (!trimmedName) {
        return NextResponse.json(
          { success: false, error: "Medicine name cannot be empty" },
          { status: 400 }
        );
      }
      updateFields.name = trimmedName;
    }

    if (body?.company !== undefined) {
      const trimmedCompany = String(body.company || "").trim();
      if (!trimmedCompany) {
        return NextResponse.json(
          { success: false, error: "Company name cannot be empty" },
          { status: 400 }
        );
      }
      updateFields.company = trimmedCompany;
    }

    if (body?.image !== undefined) {
      updateFields.image = String(body.image || "").trim();
    }
    if (body?.unitPrice !== undefined) {
      updateFields.unitPrice = String(body.unitPrice ?? "").trim();
    }
    if (body?.stripPrice !== undefined) {
      updateFields.stripPrice = String(body.stripPrice ?? "").trim();
    }
    if (body?.boxPrice !== undefined) {
      updateFields.boxPrice = String(body.boxPrice ?? "").trim();
    }
    if (body?.uses !== undefined) {
      updateFields.uses = String(body.uses || "").trim();
    }
    if (body?.dosage !== undefined) {
      updateFields.dosage = String(body.dosage || "").trim();
    }
    if (body?.sideEffects !== undefined) {
      updateFields.sideEffects = String(body.sideEffects || "").trim();
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      id,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedMedicine) {
      return NextResponse.json(
        { success: false, error: "Medicine not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedMedicine },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/medicines/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update medicine" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    await dbConnect();
    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid medicine ID" },
        { status: 400 }
      );
    }

    const deletedMedicine = await Medicine.findByIdAndDelete(id);

    if (!deletedMedicine) {
      return NextResponse.json(
        { success: false, error: "Medicine not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        deletedId: String(deletedMedicine._id),
        message: "Medicine deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/medicines/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete medicine" },
      { status: 500 }
    );
  }
}