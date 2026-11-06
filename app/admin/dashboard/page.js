"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CompanyList } from "../../data/medicines";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(CompanyList[0]);
  const [selectedMedicineName, setSelectedMedicineName] = useState("");
  
  // Form fields
  const [image, setImage] = useState("");
  const [uses, setUses] = useState("");
  const [dosage, setDosage] = useState("");
  const [sideEffects, setSideEffects] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      router.push("/admin");
    }
  }, [router]);

  const filteredCompanies = CompanyList.filter((comp) =>
    comp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    router.push("/admin");
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSuccessMsg("Successfully update kora hoyeche!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Left Sidebar */}
      <div style={{ width: "320px", background: "white", borderRight: "1px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, color: "#2563eb", fontSize: "18px" }}>🛠️ Admin Panel</h2>
          <button onClick={handleLogout} style={{ background: "#fee2e2", color: "#ef4444", border: "none", padding: "6px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
            Logout
          </button>
        </div>

        {/* Search Input in Sidebar */}
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Search company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
          />
        </div>

        {/* Company List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", margin: "5px 0" }}>COMPANIES ({filteredCompanies.length})</p>
          {filteredCompanies.map((comp, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedCompany(comp);
                setSelectedMedicineName("");
              }}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "none",
                background: selectedCompany === comp ? "#eff6ff" : "transparent",
                color: selectedCompany === comp ? "#2563eb" : "#334155",
                fontWeight: selectedCompany === comp ? "600" : "500",
                cursor: "pointer",
                fontSize: "13px",
                transition: "all 0.2s"
              }}
            >
              🏢 {comp}
            </button>
          ))}
        </div>
      </div>

      {/* Right Content Area */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        <div style={{ background: "white", padding: "35px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
          <h2 style={{ marginTop: 0, color: "#1e293b", fontSize: "22px" }}>
            Editing for: <span style={{ color: "#2563eb" }}>{selectedCompany}</span>
          </h2>

          {successMsg && (
            <div style={{ background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Medicine Name selection */}
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>
                Medicine Name:
              </label>
              <input
                type="text"
                placeholder="Jehot: Napa 500mg, Seclo 20mg..."
                value={selectedMedicineName}
                onChange={(e) => setSelectedMedicineName(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", fontSize: "15px" }}
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>
                Image Upload (Image URL or Link):
              </label>
              <input
                type="text"
                placeholder="Paste image URL here..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", fontSize: "15px" }}
              />
            </div>

            {/* Uses */}
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>
                কিসের জন্য খাওয়া হয় (Uses):
              </label>
              <textarea
                rows="3"
                placeholder="Likhe din kisher jonno khawa hoy..."
                value={uses}
                onChange={(e) => setUses(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", fontSize: "15px", fontFamily: "inherit" }}
              />
            </div>

            {/* Dosage */}
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>
                খাওয়ার নিয়ম (Dosage):
              </label>
              <textarea
                rows="3"
                placeholder="Khabarer niyom likhun..."
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", fontSize: "15px", fontFamily: "inherit" }}
              />
            </div>

            {/* Side Effects */}
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>
                পার্শ্বপ্রতিক্রিয়া (Side Effects):
              </label>
              <textarea
                rows="3"
                placeholder="Parsheprotikriya likhun..."
                value={sideEffects}
                onChange={(e) => setSideEffects(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", fontSize: "15px", fontFamily: "inherit" }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: "#2563eb",
                color: "white",
                padding: "14px 24px",
                border: "none",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "15px",
                cursor: "pointer",
                alignSelf: "flex-start"
              }}
            >
              Save Details
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}