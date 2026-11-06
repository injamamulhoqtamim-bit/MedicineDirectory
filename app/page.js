"use client";
import { useState } from "react";
import Link from "next/link";
import { medicinesData, CompanyList } from "./data/medicines";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [message, setMessage] = useState("");

  const filteredMedicines = medicinesData.filter((med) => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) {
      return selectedCompany ? med.company === selectedCompany : true;
    }
    const matchesSearch = 
      med.name.toLowerCase().includes(searchLower) || 
      med.company.toLowerCase().includes(searchLower);
    const matchesCompany = selectedCompany ? med.company === selectedCompany : true;
    return matchesSearch && matchesCompany;
  });

  // Handle adding missing/selected medicine to notification
  const handleAddToNotification = (e, med) => {
    e.preventDefault(); // Prevent opening detail link
    const existing = JSON.parse(localStorage.getItem("missingMedicines")) || [];
    
    // Check if already exists in notification list
    if (!existing.some((item) => item.id === med.id)) {
      const updated = [...existing, med];
      localStorage.setItem("missingMedicines", JSON.stringify(updated));
      window.dispatchEvent(new Event("storageUpdate"));
      setMessage(`"${med.name}" নোটিফিকেশনে যোগ করা হয়েছে!`);
      setTimeout(() => setMessage(""), 2000);
    } else {
      setMessage(`"${med.name}" ইতিমধ্যে নোটিফিকেশনে আছে!`);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  return (
    <main className="container">
      {/* Toast Message Notification */}
      {message && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#10b981",
          color: "white",
          padding: "12px 20px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
          fontWeight: "600",
          fontSize: "14px"
        }}>
          {message}
        </div>
      )}

      {/* Background Image & Glassmorphism Header */}
      <div className="header-card">
        <div className="header-content">
          <h1 className="header-title">💊 Medicine Directory</h1>
          <p className="header-subtitle">আপনার প্রয়োজনীয় ঔষধ এবং স্বনামধন্য কোম্পানির তালিকা এক জায়গায়</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 ঔষধের নাম বা কোম্পানির নাম দিয়ে সার্চ করুন..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Company List Filter */}
      <div className="filter-section">
        <h3 className="filter-title">
          কোম্পানি অনুযায়ী ফিল্টার করুন ({CompanyList.length} টি কোম্পানি):
        </h3>
        <div className="filter-buttons">
          <button
            onClick={() => setSelectedCompany("")}
            className={`filter-btn ${selectedCompany === "" ? "active" : ""}`}
          >
            🌟 সব কোম্পানি
          </button>
          {CompanyList.map((company, index) => (
            <button
              key={index}
              onClick={() => setSelectedCompany(company)}
              className={`filter-btn ${selectedCompany === company ? "active" : ""}`}
            >
              {company}
            </button>
          ))}
        </div>
      </div>

      {/* Medicine Cards Grid */}
      <div className="grid-container">
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map((med) => (
            <Link key={med.id} href={`/medicine/${med.id}`} className="card">
              <div>
                <h3>{med.name}</h3>
                <p>🏢 {med.company}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                <span className="details-btn" style={{ margin: 0 }}>
                  ডিটেইলস দেখুন <span>→</span>
                </span>
                <button
                  onClick={(e) => handleAddToNotification(e, med)}
                  style={{
                    background: "#eff6ff",
                    color: "#2563eb",
                    border: "1px solid #dbeafe",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  ➕ নাই? সিলেক্ট করুন
                </button>
              </div>
            </Link>
          ))
        ) : (
          <div style={{ textAlign: "center", gridColumn: "span 2", padding: "50px", background: "white", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
            <p style={{ color: "#64748b", fontSize: "16px", margin: 0 }}>দুঃখিত, কোনো ঔষধ বা কোম্পানি খুঁজে পাওয়া যায়নি।</p>
          </div>
        )}
      </div>
    </main>
  );
}