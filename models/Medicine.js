import mongoose from "mongoose";

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
  },
  { timestamps: true }
);

export default mongoose.models.Medicine ||
  mongoose.model("Medicine", MedicineSchema);