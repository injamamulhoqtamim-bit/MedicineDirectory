"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function RequestedMedicines() {
  const [missingList, setMissingList] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("missingMedicines")) || [];
    setMissingList(stored);
  }, []);

  const handleDelete = (id) => {
    const updated = missingList.filter((item) => item.id !== id);
    setMissingList(updated);
    localStorage.setItem("missingMedicines", JSON.stringify(updated));
    window.dispatchEvent(new Event("storageUpdate"));
  };

  // Group medicines by Company
  const groupedByCompany = missingList.reduce((acc, item) => {
    if (!acc[item.company]) {
      acc[item.company] = [];
    }
    acc[item.company].push(item);
    return acc;
  }, {});

  return (
    <main className="container">
      <Link href="/" className="back-link">← হোমপেজে ফিরে যান</Link>

      <div className="detail-box">
        <h1 style={{ marginTop: 0, color: "#1e293b", fontSize: "24px", marginBottom: "20px" }}>
          📦 আপনার সিলেক্ট করা মিসিং ওষুধের তালিকা (কোম্পানি অনুযায়ী)
        </h1>

        {Object.keys(groupedByCompany).length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            <p>কোনো ওষুধ সিলেক্ট করা হয়নি।</p>
          </div>
        ) : (
          Object.entries(groupedByCompany).map(([company, medicines]) => (
            <div key={company} style={{ marginBottom: "25px", background: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ color: "#2563eb", margin: "0 0 12px 0", fontSize: "18px" }}>
                🏢 {company}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {medicines.map((med) => (
                  <div key={med.id} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "white",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0"
                  }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: "600", color: "#1e293b", fontSize: "15px" }}>{med.name}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(med.id)}
                      style={{
                        background: "#fee2e2",
                        color: "#ef4444",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ডিলিট
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}