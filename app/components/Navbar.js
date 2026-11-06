"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [missingList, setMissingList] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("missingMedicines")) || [];
    setMissingList(stored);

    const handleStorageChange = () => {
      const updated = JSON.parse(localStorage.getItem("missingMedicines")) || [];
      setMissingList(updated);
    };

    window.addEventListener("storageUpdate", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    return () => {
      window.removeEventListener("storageUpdate", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 30px",
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      borderRadius: "16px",
      marginBottom: "20px",
      position: "sticky",
      top: "20px",
      zIndex: 1000,
      border: "1px solid rgba(226, 232, 240, 0.8)"
    }}>
      <h2 style={{ margin: 0, color: "#2563eb", fontSize: "20px" }}>💊 MedDirectory</h2>

      {/* Notification Icon to Redirect Page */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => router.push("/requested")}
          style={{
            background: "#f1f5f9",
            border: "none",
            padding: "10px 14px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "18px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Requested Medicines"
        >
          🔔
          {missingList.length > 0 && (
            <span style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "#ef4444",
              color: "white",
              fontSize: "11px",
              padding: "2px 6px",
              borderRadius: "50%",
              fontWeight: "bold"
            }}>
              {missingList.length}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}