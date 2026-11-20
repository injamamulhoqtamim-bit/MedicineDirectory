import mongoose from "mongoose";

const AlternativeBrandSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", trim: true },
    company: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const MedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    unitPrice: { type: String, default: "" },
    stripPrice: { type: String, default: "" },
    boxPrice: { type: String, default: "" },
    uses: { type: String, default: "" },
    dosage: { type: String, default: "" },
    sideEffects: { type: String, default: "" },
    alternativeBrands: { type: [AlternativeBrandSchema], default: [] },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.Medicine) {
  delete mongoose.models.Medicine;
}

export default mongoose.models.Medicine ||
  mongoose.model("Medicine", MedicineSchema);