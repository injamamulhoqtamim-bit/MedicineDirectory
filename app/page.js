"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { initialMedicines, CompanyList } from "./data/medicines";

// এখানে আপনার নিজের ছবির পাথ বা URL দিন (যেমন: "/images/pharma-banner.jpg")
const HERO_BACKGROUND_IMAGE = "/Smile.png";

function buildMergedMedicines(dbData) {
  if (!Array.isArray(dbData) || dbData.length === 0) {
    return initialMedicines;
  }

  const dbIds = new Set(dbData.map((m) => String(m?._id || "")).filter(Boolean));
  const dbKeys = new Set(
    dbData.map(
      (m) =>
        `${String(m?.name || "").toLowerCase().trim()}__${String(
          m?.company || ""
        )
          .toLowerCase()
          .trim()}`
    )
  );

  const filteredInitial = (initialMedicines || []).filter((item) => {
    const key = `${String(item?.name || "")
      .toLowerCase()
      .trim()}__${String(item?.company || "")
      .toLowerCase()
      .trim()}`;
    return !dbIds.has(String(item?.id || "")) && !dbKeys.has(key);
  });

  return [...dbData, ...filteredInitial];
}

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

  const cacheMedicinesForDetail = useCallback((list) => {
    try {
      if (Array.isArray(list) && list.length > 0) {
        sessionStorage.setItem("allMedicinesCache", JSON.stringify(list));
      }
    } catch {
      // ignore storage quota errors
    }
  }, []);

  const fetchMedicines = useCallback(async () => {
    try {
      const res = await fetch("/api/medicines", { cache: "no-store" });
      const text = await res.text();
      if (!text) return;

      const result = JSON.parse(text);
      if (res.ok && result.success && Array.isArray(result.data)) {
        const merged = buildMergedMedicines(result.data);
        setMedicinesData(merged);
        cacheMedicinesForDetail(merged);
      }
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
    }
  }, [cacheMedicinesForDetail]);

  useEffect(() => {
    try {
      const cached = JSON.parse(
        sessionStorage.getItem("allMedicinesCache") || "null"
      );
      if (Array.isArray(cached) && cached.length > 0) {
        setMedicinesData(cached);
      } else {
        cacheMedicinesForDetail(initialMedicines);
      }
    } catch {
      // ignore storage errors
    }

    fetchMedicines();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchMedicines();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchMedicines, cacheMedicinesForDetail]);

  const primeMedicineInCache = (med) => {
    try {
      const existing = JSON.parse(
        sessionStorage.getItem("allMedicinesCache") || "[]"
      );
      const list = Array.isArray(existing) ? existing : [];
      const targetId = String(med?._id || med?.id || "");
      if (!targetId) return;

      const filtered = list.filter(
        (item) => String(item?._id || item?.id || "") !== targetId
      );
      sessionStorage.setItem(
        "allMedicinesCache",
        JSON.stringify([med, ...filtered])
      );
    } catch {
      // ignore storage errors
    }
  };

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

  const hasHeroImage = Boolean(HERO_BACKGROUND_IMAGE && HERO_BACKGROUND_IMAGE.trim());

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
            background: "#0f172a",
            color: "white",
            border: "1px solid #10b981",
            padding: "12px 18px",
            borderRadius: "14px",
            boxShadow: "0 12px 24px -6px rgba(15, 23, 42, 0.25)",
            zIndex: 1000,
            fontWeight: "600",
            fontSize: isMobile ? "13px" : "14px",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          {message}
        </div>
      )}

      {/* Hero Header Card with Custom Background Image */}
      <div
        className="header-card"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: isMobile ? "24px 16px" : isTablet ? "32px 28px" : "38px 34px",
          minHeight: isMobile ? "136px" : "164px",
          display: "flex",
          alignItems: "center",
          borderRadius: isMobile ? "16px" : "22px",
          boxSizing: "border-box",
          backgroundColor: "#0f172a",
          backgroundImage: hasHeroImage
            ? `url("${HERO_BACKGROUND_IMAGE.trim()}")`
            : "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #0284c7 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          border: "1px solid #e2e8f0",
          boxShadow: "0 12px 28px -10px rgba(15, 23, 42, 0.16)",
        }}
      >
        {/* Overlay for readable text over any background image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: hasHeroImage
              ? "linear-gradient(135deg, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.48) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(15, 23, 42, 0.18) 100%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="header-content"
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: isMobile ? "flex-start" : "center",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "12px" : "16px",
            width: "100%",
          }}
        >
          <span
            style={{
              width: isMobile ? "42px" : "50px",
              height: isMobile ? "42px" : "50px",
              borderRadius: "14px",
              background:
                "linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #0ea5e9 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 8px 18px -4px rgba(37, 99, 235, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              flexShrink: 0,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={isMobile ? "22" : "26"}
              height={isMobile ? "22" : "26"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
              <path d="m8.5 8.5 7 7" />
              <circle cx="18" cy="6" r="1" fill="#ffffff" stroke="none" />
            </svg>
          </span>

          <div style={{ minWidth: 0 }}>
            <h1
              className="header-title"
              style={{
                fontSize: isMobile ? "21px" : isTablet ? "25px" : "29px",
                fontWeight: "800",
                lineHeight: "1.25",
                margin: "0 0 6px 0",
                color: "#ffffff",
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.35)",
              }}
            >
              Sheikh Drugs Pharma
            </h1>
            <p
              className="header-subtitle"
              style={{
                fontSize: isMobile ? "13.5px" : "15px",
                lineHeight: "1.5",
                margin: 0,
                color: "rgba(255, 255, 255, 0.92)",
                textShadow: "0 1px 6px rgba(0, 0, 0, 0.3)",
              }}
            >
              আপনার প্রয়োজনীয় ঔষধ এবং স্বনামধন্য কোম্পানির তালিকা এক জায়গায়
            </p>
          </div>
        </div>
      </div>

      <div
        className="filter-section"
        style={{
          padding: isMobile ? "14px" : "20px",
          borderRadius: isMobile ? "16px" : "20px",
          boxSizing: "border-box",
          marginTop: isMobile ? "16px" : "20px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 8px 20px -10px rgba(15, 23, 42, 0.05)",
        }}
      >
        <h3
          className="filter-title"
          style={{
            fontSize: isMobile ? "14px" : "16px",
            lineHeight: "1.45",
            marginTop: 0,
            marginBottom: "12px",
            color: "#0f172a",
            fontWeight: "700",
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
                prefetch={true}
                onMouseEnter={() => primeMedicineInCache(med)}
                onTouchStart={() => primeMedicineInCache(med)}
                onClick={() => primeMedicineInCache(med)}
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
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        style={{
                          width: "100%",
                          height: isMobile ? "135px" : "150px",
                          objectFit: "cover",
                          borderRadius: "12px",
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                  <h3
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: isMobile ? "16px" : "18px",
                      fontWeight: "700",
                      color: "#0f172a",
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
                      color: "#475569",
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
                      borderRadius: "9px",
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