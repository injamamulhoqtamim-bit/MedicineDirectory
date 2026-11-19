"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { initialMedicines, CompanyList } from "./data/medicines";

// ফাইলটি public ফোল্ডারের ভেতরে থাকলে নিচের পাথ কাজ করবে (যেমন: "/pharmacist-banner.png" বা "/Smiling Pharmacist Using Smartphone.png")
const HERO_BACKGROUND_IMAGE = "/Smiling Pharmacist Using Smartphone.png";

function getSafeBackgroundUrl(rawPath) {
  if (!rawPath || typeof rawPath !== "string") return "";
  const trimmed = rawPath.trim();
  if (!trimmed) return "";
  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return encodeURI(normalized);
}

function formatPriceLabel(value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "";
  }
  const str = String(value).trim();
  return str.startsWith("৳") ? str : `৳${str}`;
}

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
  const [navbarSearch, setNavbarSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companyMedQuery, setCompanyMedQuery] = useState("");
  const [activeCompanyMedSearch, setActiveCompanyMedSearch] = useState("");
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

  const resetAllFilters = useCallback(() => {
    setSearchTerm("");
    setNavbarSearch("");
    setSelectedCompany("");
    setCompanyMedQuery("");
    setActiveCompanyMedSearch("");
    sessionStorage.setItem("medicineSearchTerm", "");
    window.dispatchEvent(new CustomEvent("navbarSearchSync", { detail: "" }));
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", "/");
    }
  }, []);

  // Navbar থেকে আসা সার্চ ভ্যালু ও রিসেট ইভেন্ট রিসিভ করা
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSearch = params.get("search");
    const savedSearch = sessionStorage.getItem("medicineSearchTerm");
    const initialSearch = urlSearch !== null ? urlSearch : savedSearch || "";

    if (initialSearch) {
      setSearchTerm(initialSearch);
      setNavbarSearch(initialSearch);
      setSelectedCompany("");
      setCompanyMedQuery("");
      setActiveCompanyMedSearch("");
      sessionStorage.setItem("medicineSearchTerm", initialSearch);
      window.dispatchEvent(
        new CustomEvent("navbarSearchSync", { detail: initialSearch })
      );
    }

    const handleNavbarSearch = (e) => {
      const val = String(e?.detail || "");
      setSearchTerm(val);
      setNavbarSearch(val);
      if (val.trim()) {
        setSelectedCompany("");
        setCompanyMedQuery("");
        setActiveCompanyMedSearch("");
      }
    };

    window.addEventListener("navbarSearch", handleNavbarSearch);
    window.addEventListener("resetAllFilters", resetAllFilters);

    return () => {
      window.removeEventListener("navbarSearch", handleNavbarSearch);
      window.removeEventListener("resetAllFilters", resetAllFilters);
    };
  }, [resetAllFilters]);

  const syncSearchToNavbar = (val) => {
    setSearchTerm(val);
    setNavbarSearch(val);
    sessionStorage.setItem("medicineSearchTerm", val);
    window.dispatchEvent(
      new CustomEvent("navbarSearchSync", { detail: val })
    );
  };

  const resetCompanyMedSearch = () => {
    setCompanyMedQuery("");
    setActiveCompanyMedSearch("");
  };

  const handleCompanyMedSearchSubmit = (e) => {
    e.preventDefault();
    setActiveCompanyMedSearch(companyMedQuery.trim());
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
  const effectiveSearch = String(navbarSearch || searchTerm || "").trim();
  const searchLower = effectiveSearch.toLowerCase();
  const companyQueryLower = activeCompanyMedSearch.trim().toLowerCase();

  const visibleMedicines = useMemo(() => {
    const q = navbarSearch.trim().toLowerCase();
    if (!q) return medicinesData;
    return medicinesData.filter((med) => {
      const nameMatch = String(med.name || "").toLowerCase().includes(q);
      const companyMatch = String(med.company || "").toLowerCase().includes(q);
      const usesMatch = String(med.uses || "").toLowerCase().includes(q);
      return nameMatch || companyMatch || usesMatch;
    });
  }, [medicinesData, navbarSearch]);

  const filteredMedicines = useMemo(() => {
    return visibleMedicines.filter((med) => {
      if (searchLower) {
        return true;
      }
      if (selectedCompany) {
        if (med.company !== selectedCompany) return false;
        if (companyQueryLower) {
          const nameMatch = String(med.name || "")
            .toLowerCase()
            .includes(companyQueryLower);
          const usesMatch = String(med.uses || "")
            .toLowerCase()
            .includes(companyQueryLower);
          const dosageMatch = String(med.dosage || "")
            .toLowerCase()
            .includes(companyQueryLower);
          return nameMatch || usesMatch || dosageMatch;
        }
        return true;
      }
      return true;
    });
  }, [visibleMedicines, searchLower, selectedCompany, companyQueryLower]);

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

  const safeHeroUrl = getSafeBackgroundUrl(HERO_BACKGROUND_IMAGE);
  const hasHeroImage = Boolean(safeHeroUrl);

  return (
    <main
      className="container"
      style={{
        width: "100%",
        maxWidth: "1360px",
        margin: "0 auto",
        padding: isMobile ? "10px" : isTablet ? "16px" : "24px 20px",
        boxSizing: "border-box",
        overflowX: "clip",
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
          padding: isMobile ? "20px 14px" : isTablet ? "28px 22px" : "38px 34px",
          minHeight: isMobile ? "150px" : "196px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: isMobile ? "16px" : "22px",
          boxSizing: "border-box",
          backgroundColor: "#0f172a",
          border: "1px solid #e2e8f0",
          boxShadow: "0 12px 28px -10px rgba(15, 23, 42, 0.16)",
        }}
      >
        {hasHeroImage && (
          <img
            src={safeHeroUrl}
            alt="Sheikh Drugs Pharma Banner"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}

        {/* Overlay for readable text over any background image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: hasHeroImage
              ? "linear-gradient(135deg, rgba(15, 23, 42, 0.68) 0%, rgba(15, 23, 42, 0.45) 100%)"
              : "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #0284c7 100%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <div
          className="header-content"
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            width: "100%",
            maxWidth: "800px",
            gap: isMobile ? "4px" : "6px",
          }}
        >
          <h1
            className="header-title"
            style={{
              fontSize: isMobile ? "18px" : isTablet ? "23px" : "28px",
              fontWeight: "800",
              lineHeight: "1.3",
              margin: 0,
              color: "#ffffff",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.4)",
              wordBreak: "break-word",
            }}
          >
            ঔষধ / কোম্পানির নাম সার্চ করুন
          </h1>
          <h2
            style={{
              fontSize: isMobile ? "15px" : isTablet ? "19px" : "22px",
              fontWeight: "700",
              lineHeight: "1.35",
              margin: 0,
              color: "#e0f2fe",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.38)",
              wordBreak: "break-word",
            }}
          >
            ঔষধ সম্পর্কে জানুন
          </h2>
          <p
            className="header-subtitle"
            style={{
              fontSize: isMobile ? "12px" : "15px",
              lineHeight: "1.5",
              margin: "2px 0 0 0",
              color: "rgba(255, 255, 255, 0.94)",
              textShadow: "0 1px 6px rgba(0, 0, 0, 0.35)",
              wordBreak: "break-word",
            }}
          >
            ব্যবহার, খাওয়ার নিয়ম ও পার্শ্বপ্রতিক্রিয়ার সঠিক তথ্য সহজেই খুঁজুন
          </p>
        </div>
      </div>

      {/* Company Filter Section */}
      <div
        className="filter-section"
        style={{
          padding: isMobile ? "12px" : isTablet ? "16px" : "20px",
          borderRadius: isMobile ? "16px" : "20px",
          boxSizing: "border-box",
          marginTop: isMobile ? "14px" : "20px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 8px 20px -10px rgba(15, 23, 42, 0.05)",
        }}
      >
        <h3
          className="filter-title"
          style={{
            fontSize: isMobile ? "13.5px" : "16px",
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
            gap: isMobile ? "6px" : "10px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              resetAllFilters();
            }}
            className={`filter-btn ${
              selectedCompany === "" && !searchLower ? "active" : ""
            }`}
            style={{
              fontSize: isMobile ? "11.5px" : "13.5px",
              padding: isMobile ? "6px 10px" : "8px 14px",
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
                  resetCompanyMedSearch();
                  syncSearchToNavbar("");
                }}
                className={`filter-btn ${isSelected ? "active" : ""}`}
                style={{
                  fontSize: isMobile ? "11.5px" : "13.5px",
                  padding: isMobile ? "6px 10px" : "8px 14px",
                  maxWidth: "100%",
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

      {/* Selected Company Medicine Search Bar (Shows above cards when a company is selected) */}
      {selectedCompany && !searchLower && (
        <div
          style={{
            marginTop: isMobile ? "14px" : "20px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: isMobile ? "14px" : "18px",
            padding: isMobile ? "12px" : "16px 20px",
            boxShadow: "0 6px 18px -8px rgba(15, 23, 42, 0.06)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontSize: isMobile ? "13px" : "14.5px",
                fontWeight: "700",
                color: "#0f172a",
                wordBreak: "break-word",
              }}
            >
              🏢 {selectedCompany}-এর ওষুধ খুঁজুন ({filteredMedicines.length})
            </span>

            {activeCompanyMedSearch && (
              <button
                type="button"
                onClick={resetCompanyMedSearch}
                style={{
                  background: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                সব ওষুধ দেখুন
              </button>
            )}
          </div>

          <form
            onSubmit={handleCompanyMedSearchSubmit}
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "8px",
              alignItems: "stretch",
            }}
          >
            <input
              type="text"
              value={companyMedQuery}
              onChange={(e) => {
                const val = e.target.value;
                setCompanyMedQuery(val);
                setActiveCompanyMedSearch(val.trim());
              }}
              placeholder={`${selectedCompany}-এর ওষুধের নাম লিখুন...`}
              aria-label={`Search medicines in ${selectedCompany}`}
              style={{
                flex: 1,
                minWidth: 0,
                padding: isMobile ? "9px 12px" : "10px 14px",
                borderRadius: "11px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                outline: "none",
                fontSize: isMobile ? "13px" : "14px",
                color: "#0f172a",
                boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              {companyMedQuery && (
                <button
                  type="button"
                  onClick={resetCompanyMedSearch}
                  aria-label="Clear company medicine search"
                  style={{
                    background: "#e2e8f0",
                    color: "#334155",
                    border: "none",
                    borderRadius: "10px",
                    padding: isMobile ? "9px 12px" : "10px 13px",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              )}

              <button
                type="submit"
                style={{
                  flex: isMobile ? 1 : "initial",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "11px",
                  padding: isMobile ? "9px 14px" : "10px 18px",
                  fontSize: isMobile ? "12.5px" : "13.5px",
                  fontWeight: "700",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px -3px rgba(29, 78, 216, 0.4)",
                }}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Responsive Grid: 2 cards on mobile, 3 on tablet, 4 on desktop */}
      <div
        id="medicine-results-section"
        className="grid-container"
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(2, minmax(0, 1fr))"
            : isTablet
            ? "repeat(3, minmax(0, 1fr))"
            : "repeat(4, minmax(0, 1fr))",
          gap: isMobile ? "10px" : isTablet ? "14px" : "18px",
          marginTop: isMobile ? "14px" : "22px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map((med) => {
            const uniqueId = med._id || med.id;
            const unitLabel = formatPriceLabel(med.unitPrice);
            const stripLabel = formatPriceLabel(med.stripPrice);
            const boxLabel = formatPriceLabel(med.boxPrice);

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
                  padding: isMobile ? "10px" : isTablet ? "13px" : "16px",
                  borderRadius: isMobile ? "13px" : "18px",
                  boxSizing: "border-box",
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  {med.image && (
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: isMobile ? "104px" : isTablet ? "128px" : "150px",
                        overflow: "hidden",
                        borderRadius: isMobile ? "9px" : "12px",
                        background: "#f1f5f9",
                        marginBottom: isMobile ? "8px" : "10px",
                      }}
                    >
                      <img
                        src={med.image}
                        alt={med.name}
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />

                      {/* Top-Left: Unit Price */}
                      {unitLabel && (
                        <span
                          style={{
                            position: "absolute",
                            top: isMobile ? "5px" : "7px",
                            left: isMobile ? "5px" : "7px",
                            background: "rgba(15, 23, 42, 0.86)",
                            color: "#ffffff",
                            fontSize: isMobile ? "9.5px" : "10.5px",
                            fontWeight: "700",
                            padding: isMobile ? "2px 6px" : "3px 7px",
                            borderRadius: "6px",
                            backdropFilter: "blur(4px)",
                            lineHeight: 1.2,
                            maxWidth: "48%",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          U: {unitLabel}
                        </span>
                      )}

                      {/* Top-Right: Strip Price */}
                      {stripLabel && (
                        <span
                          style={{
                            position: "absolute",
                            top: isMobile ? "5px" : "7px",
                            right: isMobile ? "5px" : "7px",
                            background: "rgba(29, 78, 216, 0.92)",
                            color: "#ffffff",
                            fontSize: isMobile ? "9.5px" : "10.5px",
                            fontWeight: "700",
                            padding: isMobile ? "2px 6px" : "3px 7px",
                            borderRadius: "6px",
                            backdropFilter: "blur(4px)",
                            lineHeight: 1.2,
                            maxWidth: "48%",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          S: {stripLabel}
                        </span>
                      )}

                      {/* Bottom-Right: Full Box Price */}
                      {boxLabel && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: isMobile ? "5px" : "7px",
                            right: isMobile ? "5px" : "7px",
                            background: "rgba(5, 150, 105, 0.94)",
                            color: "#ffffff",
                            fontSize: isMobile ? "9.5px" : "10.5px",
                            fontWeight: "700",
                            padding: isMobile ? "2px 6px" : "3px 7px",
                            borderRadius: "6px",
                            backdropFilter: "blur(4px)",
                            lineHeight: 1.2,
                            maxWidth: "70%",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          Box: {boxLabel}
                        </span>
                      )}
                    </div>
                  )}
                  <h3
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: isMobile ? "12.5px" : isTablet ? "14px" : "16px",
                      fontWeight: "700",
                      color: "#0f172a",
                      lineHeight: "1.3",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {med.name}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: isMobile ? "10.5px" : isTablet ? "12px" : "13px",
                      lineHeight: "1.35",
                      color: "#475569",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    🏢 {med.company}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    gap: isMobile ? "6px" : "8px",
                    marginTop: isMobile ? "10px" : "14px",
                    minWidth: 0,
                  }}
                >
                  <span
                    className="details-btn"
                    style={{
                      margin: 0,
                      fontSize: isMobile ? "10.5px" : isTablet ? "11.5px" : "13px",
                      lineHeight: 1.25,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "3px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    ডিটেইলস দেখুন <span>→</span>
                  </span>

                  {/* Premium Original "নাই? সিলেক্ট করুন" Button */}
                  <button
                    type="button"
                    onClick={(e) => handleAddToNotification(e, med)}
                    style={{
                      background:
                        "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                      color: "#1d4ed8",
                      border: "1px solid #93c5fd",
                      padding: isMobile ? "6px 6px" : isTablet ? "7px 8px" : "8px 10px",
                      borderRadius: isMobile ? "9px" : "11px",
                      fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: isMobile ? "4px" : "5px",
                      boxShadow:
                        "0 4px 12px -3px rgba(37, 99, 235, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                      transition: "all 0.18s ease",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    <span
                      style={{
                        width: isMobile ? "14px" : "16px",
                        height: isMobile ? "14px" : "16px",
                        borderRadius: "4px",
                        background:
                          "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                        color: "#ffffff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? "10px" : "12px",
                        fontWeight: "800",
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      +
                    </span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      নাই? সিলেক্ট করুন
                    </span>
                  </button>
                </div>
              </Link>
            );
          })
        ) : (
          <div
            style={{
              textAlign: "center",
              gridColumn: "1 / -1",
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