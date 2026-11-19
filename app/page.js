"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { initialMedicines, CompanyList } from "./data/medicines";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [medicinesData, setMedicinesData] = useState(initialMedicines);
  const [message, setMessage] = useState("");
  const [viewport, setViewport] = useState("desktop"); // "mobile" | "tablet" | "desktop"

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setViewport("mobile");
      } else if (width < 1024) {
        setViewport("tablet");
      } else {
        setViewport("desktop");
      }
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Navbar থেকে আসা সার্চ ভ্যালু রিসিভ করা
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSearch = params.get("search");
    const savedSearch = sessionStorage.getItem("medicineSearchTerm");
    const initialSearch = urlSearch !== null ? urlSearch : savedSearch || "";

    if (initialSearch) {
      setSearchTerm(initialSearch);
      setSelectedCompany("");
      sessionStorage.setItem("medicineSearchTerm", initialSearch);
      window.dispatchEvent(
        new CustomEvent("navbarSearchSync", { detail: initialSearch })
      );
    }

    const handleNavbarSearch = (e) => {
      const val = String(e?.detail || "");
      setSearchTerm(val);
      if (val.trim()) {
        setSelectedCompany("");
      }
    };

    window.addEventListener("navbarSearch", handleNavbarSearch);
    return () => {
      window.removeEventListener("navbarSearch", handleNavbarSearch);
    };
  }, []);

  const syncSearchToNavbar = (val) => {
    setSearchTerm(val);
    sessionStorage.setItem("medicineSearchTerm", val);
    window.dispatchEvent(
      new CustomEvent("navbarSearchSync", { detail: val })
    );
  };

  const fetchMedicines = useCallback(async () => {
    try {
      const res = await fetch("/api/medicines", { cache: "no-store" });
      const text = await res.text();
      if (!text) return;

      const result = JSON.parse(text);
      if (res.ok && result.success && Array.isArray(result.data)) {
        const dbIds = new Set(result.data.map((m) => String(m._id)));
        const dbKeys = new Set(
          result.data.map(
            (m) =>
              `${String(m.name || "").toLowerCase().trim()}__${String(
                m.company || ""
              )
                .toLowerCase()
                .trim()}`
          )
        );

        const filteredInitial = initialMedicines.filter((item) => {
          const key = `${String(item.name || "")
            .toLowerCase()
            .trim()}__${String(item.company || "")
            .toLowerCase()
            .trim()}`;
          return !dbIds.has(String(item.id)) && !dbKeys.has(key);
        });

        setMedicinesData([...result.data, ...filteredInitial]);
      }
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();

    const handleFocus = () => {
      fetchMedicines();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchMedicines]);

  const isMobile = viewport === "mobile";
  const isTablet = viewport === "tablet";
  const searchLower = String(searchTerm || "").toLowerCase().trim();

  const filteredMedicines = medicinesData.filter((med) => {
    const medName = String(med.name || "").toLowerCase();
    const medCompany = String(med.company || "").toLowerCase();
    const medUses = String(med.uses || "").toLowerCase();

    if (searchLower) {
      return (
        medName.includes(searchLower) ||
        medCompany.includes(searchLower) ||
        medUses.includes(searchLower)
      );
    }

    if (selectedCompany) {
      return med.company === selectedCompany;
    }

    return true;
  });

  const handleAddToNotification = (e, med) => {
    e.preventDefault();
    e.stopPropagation();
    const existing = JSON.parse(localStorage.getItem("missingMedicines")) || [];
    const medId = med._id || med.id;
    if (!existing.some((item) => (item._id || item.id) === medId)) {
      const updated = [...existing, med];
      localStorage.setItem("missingMedicines", JSON.stringify(updated));
      window.dispatchEvent(new Event("storageUpdate"));
      setMessage(`"${med.name}" নোটিফিকেশনে যোগ করা হয়েছে!`);
      setTimeout(() => setMessage(""), 2000);
    } else {
      setMessage(`"${med.name}" ইতিমধ্যে নোটিফিকেশনে আছে!`);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  return (
    <main
      className="container"
      style={{
        width: "100%",
        maxWidth: "1140px",
        margin: "0 auto",
        padding: isMobile ? "14px" : isTablet ? "22px 20px" : "28px 24px",
        boxSizing: "border-box",
      }}
    >
      {message && (
        <div
          style={{
            position: "fixed",
            bottom: isMobile ? "14px" : "20px",
            right: isMobile ? "14px" : "20px",
            left: isMobile ? "14px" : "auto",
            background: "#10b981",
            color: "white",
            padding: "12px 18px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
            fontWeight: "600",
            fontSize: isMobile ? "13px" : "14px",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          {message}
        </div>
      )}

      <div
        className="header-card"
        style={{
          padding: isMobile ? "20px 16px" : "28px 24px",
          borderRadius: isMobile ? "16px" : "20px",
          boxSizing: "border-box",
        }}
      >
        <div className="header-content">
          <h1
            className="header-title"
            style={{
              fontSize: isMobile ? "22px" : isTablet ? "26px" : "30px",
              lineHeight: "1.3",
              margin: "0 0 6px 0",
            }}
          >
            💊 Medicine Directory
          </h1>
          <p
            className="header-subtitle"
            style={{
              fontSize: isMobile ? "13.5px" : "15px",
              lineHeight: "1.5",
              margin: 0,
            }}
          >
            আপনার প্রয়োজনীয় ঔষধ এবং স্বনামধন্য কোম্পানির তালিকা এক জায়গায়
          </p>
        </div>
      </div>

      <div
        className="filter-section"
        style={{
          padding: isMobile ? "14px" : "20px",
          borderRadius: isMobile ? "16px" : "20px",
          boxSizing: "border-box",
          marginTop: isMobile ? "16px" : "20px",
        }}
      >
        <h3
          className="filter-title"
          style={{
            fontSize: isMobile ? "14px" : "16px",
            lineHeight: "1.45",
            marginTop: 0,
            marginBottom: "12px",
          }}
        >
          কোম্পানি অনুযায়ী ফিল্টার করুন ({CompanyList.length} টি কোম্পানি):
        </h3>
        <div
          className="filter-buttons"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: isMobile ? "8px" : "10px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setSelectedCompany("");
              syncSearchToNavbar("");
            }}
            className={`filter-btn ${
              selectedCompany === "" && !searchLower ? "active" : ""
            }`}
            style={{
              fontSize: isMobile ? "12.5px" : "13.5px",
              padding: isMobile ? "7px 12px" : "8px 14px",
            }}
          >
            🌟 সব কোম্পানি
          </button>
          {CompanyList.map((company, index) => {
            const isSearchMatched =
              searchLower.length > 0 &&
              String(company || "").toLowerCase().includes(searchLower);
            const isSelected = selectedCompany === company;

            return (
              <button
                type="button"
                key={index}
                onClick={() => {
                  setSelectedCompany(company);
                  syncSearchToNavbar("");
                }}
                className={`filter-btn ${isSelected ? "active" : ""}`}
                style={{
                  fontSize: isMobile ? "12.5px" : "13.5px",
                  padding: isMobile ? "7px 12px" : "8px 14px",
                  ...(isSearchMatched
                    ? {
                        backgroundColor: "#dc2626",
                        color: "#ffffff",
                        borderColor: "#dc2626",
                        fontWeight: "700",
                        boxShadow: "0 4px 10px rgba(220, 38, 38, 0.25)",
                      }
                    : {
                        backgroundColor: isSelected ? undefined : "#ffffff",
                      }),
                }}
              >
                {company}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="grid-container"
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
          gap: isMobile ? "14px" : "20px",
          marginTop: isMobile ? "16px" : "22px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map((med) => {
            const uniqueId = med._id || med.id;
            return (
              <Link
                key={uniqueId}
                href={`/medicine/${uniqueId}`}
                className="card"
                style={{
                  padding: isMobile ? "16px" : "20px",
                  borderRadius: isMobile ? "16px" : "20px",
                  boxSizing: "border-box",
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {med.image && (
                    <div style={{ marginBottom: "12px", textAlign: "center" }}>
                      <img
                        src={med.image}
                        alt={med.name}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        style={{
                          width: "100%",
                          height: isMobile ? "135px" : "150px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                  <h3
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: isMobile ? "16px" : "18px",
                      lineHeight: "1.35",
                      wordBreak: "break-word",
                    }}
                  >
                    {med.name}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: isMobile ? "13px" : "14px",
                      lineHeight: "1.45",
                      wordBreak: "break-word",
                    }}
                  >
                    🏢 {med.company}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "16px",
                  }}
                >
                  <span
                    className="details-btn"
                    style={{
                      margin: 0,
                      fontSize: isMobile ? "13px" : "14px",
                    }}
                  >
                    ডিটেইলস দেখুন <span>→</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleAddToNotification(e, med)}
                    style={{
                      background: "#eff6ff",
                      color: "#2563eb",
                      border: "1px solid #dbeafe",
                      padding: isMobile ? "6px 10px" : "7px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ➕ নাই? সিলেক্ট করুন
                  </button>
                </div>
              </Link>
            );
          })
        ) : (
          <div
            style={{
              textAlign: "center",
              gridColumn: isMobile ? "span 1" : "span 2",
              padding: isMobile ? "34px 18px" : "50px",
              background: "white",
              borderRadius: isMobile ? "16px" : "20px",
              border: "1px solid #e2e8f0",
              boxSizing: "border-box",
            }}
          >
            <p
              style={{
                color: "#64748b",
                fontSize: isMobile ? "14px" : "16px",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              দুঃখিত, কোনো ঔষধ বা কোম্পানি খুঁজে পাওয়া যায়নি।
            </p>
          </div>
        )}
      </div>
    </main>
  );
}