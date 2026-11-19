import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    image: { type: String, trim: true, default: "" },
    uses: { type: String, trim: true, default: "" },
    dosage: { type: String, trim: true, default: "" },
    sideEffects: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Medicine ||
  mongoose.model("Medicine", MedicineSchema);