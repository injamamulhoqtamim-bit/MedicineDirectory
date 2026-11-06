import Link from "next/link";
import { medicinesData } from "../../data/medicines";

export default async function MedicineDetail({ params }) {
  const resolvedParams = await params;
  const medicine = medicinesData.find((m) => m.id === resolvedParams.id);

  if (!medicine) {
    return (
      <main className="container" style={{ textAlign: "center", marginTop: "100px" }}>
        <h2 style={{ color: "#ef4444" }}>মেডিসিন পাওয়া যায়নি!</h2>
        <Link href="/" className="back-link">হোমপেজে ফিরে যান</Link>
      </main>
    );
  }

  return (
    <main className="container">
      <Link href="/" className="back-link">← ব্যাকে যান</Link>

      <div className="detail-box">
        {/* Medicine Image */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <img
            src={medicine.image}
            alt={medicine.name}
            style={{
              width: "100%",
              maxHeight: "280px",
              objectFit: "cover",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}
          />
        </div>

        <h1 style={{ marginTop: 0, color: "#1e293b", fontSize: "28px" }}>{medicine.name}</h1>
        <p style={{ color: "#2563eb", fontWeight: "600", marginBottom: "24px" }}>🏢 কোম্পানি: {medicine.company}</p>

        <div className="info-card uses">
          <h3 style={{ margin: "0 0 6px 0" }}>💡 কিসের জন্য খাওয়া হয় (Uses):</h3>
          <p style={{ margin: 0, lineHeight: "1.6" }}>{medicine.uses}</p>
        </div>

        <div className="info-card dosage">
          <h3 style={{ margin: "0 0 6px 0" }}>⏰ খাওয়ার নিয়ম (Dosage):</h3>
          <p style={{ margin: 0, lineHeight: "1.6" }}>{medicine.dosage}</p>
        </div>

        <div className="info-card side-effects">
          <h3 style={{ margin: "0 0 6px 0" }}>⚠️ পার্শ্বপ্রতিক্রিয়া (Side Effects):</h3>
          <p style={{ margin: 0, lineHeight: "1.6" }}>{medicine.sideEffects}</p>
        </div>
      </div>
    </main>
  );
}