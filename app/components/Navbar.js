"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { initialMedicines } from "../data/medicines";

function buildNavbarMedicines(dbData) {
  if (!Array.isArray(dbData) || dbData.length === 0) {
    return initialMedicines || [];
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

function splitMedicineNameAndDosage(fullName) {
  const raw = String(fullName || "").trim();
  const match = raw.match(
    /^(.*?)\s+(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g|iu|%)(?:\s*\/\s*[a-zA-Z]+)?)$/i
  );
  if (match) {
    return { baseName: match[1], strength: match[2] };
  }
  return { baseName: raw, strength: "" };
}

export default function Navbar() {
  const [missingList, setMissingList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [medicinesList, setMedicinesList] = useState(initialMedicines || []);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [viewport, setViewport] = useState("desktop"); // "mobile" | "tablet" | "desktop"

  const searchWrapperRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

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

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("missingMedicines")) || [];
    setMissingList(stored);

    const savedSearch = sessionStorage.getItem("medicineSearchTerm") || "";
    setSearchQuery(savedSearch);

    try {
      const cached = JSON.parse(
        sessionStorage.getItem("allMedicinesCache") || "null"
      );
      if (Array.isArray(cached) && cached.length > 0) {
        setMedicinesList(cached);
      }
    } catch {
      // ignore storage error
    }

    fetch("/api/medicines", { cache: "no-store" })
      .then((res) => res.text())
      .then((text) => {
        if (!text) return;
        const result = JSON.parse(text);
        if (result?.success && Array.isArray(result.data)) {
          setMedicinesList(buildNavbarMedicines(result.data));
        }
      })
      .catch(() => {});

    const handleStorageChange = () => {
      const updated = JSON.parse(localStorage.getItem("missingMedicines")) || [];
      setMissingList(updated);
    };

    const handleExternalSearchSync = (e) => {
      const nextVal =
        e?.detail !== undefined
          ? String(e.detail)
          : sessionStorage.getItem("medicineSearchTerm") || "";
      setSearchQuery(nextVal);
    };

    window.addEventListener("storageUpdate", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    window.addEventListener("navbarSearchSync", handleExternalSearchSync);

    return () => {
      window.removeEventListener("storageUpdate", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
      window.removeEventListener("navbarSearchSync", handleExternalSearchSync);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const matchedMedicines = useMemo(() => {
    const q = String(searchQuery || "").trim().toLowerCase();
    if (!q) return [];
    return medicinesList
      .filter((med) => {
        const nameMatch = String(med?.name || "").toLowerCase().includes(q);
        const companyMatch = String(med?.company || "")
          .toLowerCase()
          .includes(q);
        const usesMatch = String(med?.uses || "").toLowerCase().includes(q);
        return nameMatch || companyMatch || usesMatch;
      })
      .slice(0, 12);
  }, [medicinesList, searchQuery]);

  const broadcastSearch = (val) => {
    sessionStorage.setItem("medicineSearchTerm", val);
    window.dispatchEvent(new CustomEvent("navbarSearch", { detail: val }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setHoveredIndex(-1);
    setDropdownOpen(value.trim().length > 0);
    broadcastSearch(value);
  };

  const handleSelectSuggestion = (med) => {
    const uniqueId = med?._id || med?.id;
    if (!uniqueId) return;

    try {
      const existing = JSON.parse(
        sessionStorage.getItem("allMedicinesCache") || "[]"
      );
      const list = Array.isArray(existing) ? existing : [];
      const filtered = list.filter(
        (item) => String(item?._id || item?.id || "") !== String(uniqueId)
      );
      sessionStorage.setItem(
        "allMedicinesCache",
        JSON.stringify([med, ...filtered])
      );
    } catch {
      // ignore storage error
    }

    setDropdownOpen(false);
    router.push(`/medicine/${uniqueId}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    broadcastSearch(searchQuery);
    setDropdownOpen(false);

    if (pathname !== "/") {
      router.push(trimmed ? `/?search=${encodeURIComponent(trimmed)}` : "/");
    } else if (trimmed) {
      const resultsEl = document.getElementById("medicine-results-section");
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setHoveredIndex(-1);
    setDropdownOpen(false);
    broadcastSearch("");
  };

  const handleLogoOrBrandClick = () => {
    setSearchQuery("");
    setHoveredIndex(-1);
    setDropdownOpen(false);
    sessionStorage.setItem("medicineSearchTerm", "");
    window.dispatchEvent(new CustomEvent("resetAllFilters"));
    window.dispatchEvent(new CustomEvent("navbarSearch", { detail: "" }));
    router.push("/");
  };

  // যদি রুটটি /admin দিয়ে শুরু হয়, তবে Navbar দেখাবে না
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  const isMobile = viewport === "mobile";
  const isTablet = viewport === "tablet";
  const showDropdown = dropdownOpen && searchQuery.trim().length > 0;

  const renderBrandLogo = () => (
    <button
      type="button"
      onClick={handleLogoOrBrandClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? "8px" : "11px",
        background: "transparent",
        border: "none",
        padding: "2px 0",
        cursor: "pointer",
        minWidth: 0,
        flexShrink: 0,
        textAlign: "left",
      }}
    >
      {/* Premium Pharma Emblem Logo */}
      <span
        style={{
          width: isMobile ? "34px" : "42px",
          height: isMobile ? "34px" : "42px",
          borderRadius: isMobile ? "10px" : "13px",
          background:
            "linear-gradient(135deg, #0ea5e9 0%, #2563eb 55%, #38bdf8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            "0 8px 18px -4px rgba(14, 165, 233, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.45)",
          border: "1px solid rgba(255, 255, 255, 0.35)",
          flexShrink: 0,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={isMobile ? "18" : "23"}
          height={isMobile ? "18" : "23"}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          <path d="m8.5 8.5 7 7" />
          <circle cx="18" cy="6" r="1" fill="#ffffff" stroke="none" />
        </svg>
      </span>

      <span
        style={{
          display: "flex",
          flexDirection: "column",
          lineHeight: 1.15,
          minWidth: 0,
        }}
      >
        <span
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: isMobile ? "14.5px" : isTablet ? "17px" : "19.5px",
            fontWeight: "800",
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
          }}
        >
          Sheikh Drugs Pharma
        </span>
        {!isMobile && (
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: "700",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "#bae6fd",
              marginTop: "2px",
              whiteSpace: "nowrap",
            }}
          >
            Medicine Directory
          </span>
        )}
      </span>
    </button>
  );

  return (
    <nav
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "stretch" : "center",
        gap: isMobile ? "10px" : isTablet ? "12px" : "16px",
        padding: isMobile ? "10px 12px" : isTablet ? "12px 16px" : "14px 24px",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)",
        boxShadow:
          "0 16px 32px -8px rgba(15, 23, 42, 0.28), 0 6px 14px -4px rgba(29, 78, 216, 0.2)",
        borderRadius: isMobile ? "16px" : "20px",
        marginTop: isMobile ? "8px" : "14px",
        marginBottom: isMobile ? "12px" : "20px",
        position: "sticky",
        top: isMobile ? "8px" : "14px",
        zIndex: 1000,
        border: "1px solid rgba(147, 197, 253, 0.35)",
        boxSizing: "border-box",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      {/* Top Row on Mobile: Brand Logo + Requested Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
          width: isMobile ? "100%" : "auto",
          minWidth: 0,
        }}
      >
        {renderBrandLogo()}

        {isMobile && (
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => router.push("/requested")}
              style={{
                background: "rgba(255, 255, 255, 0.14)",
                border: "1px solid rgba(255, 255, 255, 0.28)",
                padding: "8px 10px",
                borderRadius: "11px",
                cursor: "pointer",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              }}
              title="Requested Medicines"
              aria-label="Requested Medicines"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {missingList.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background:
                      "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "#ffffff",
                    fontSize: "10.5px",
                    minWidth: "19px",
                    height: "19px",
                    padding: "0 4px",
                    borderRadius: "999px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #0f172a",
                    boxSizing: "border-box",
                  }}
                >
                  {missingList.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Navbar Search Bar + Clean Dropdown List */}
      <div
        ref={searchWrapperRef}
        style={{
          position: "relative",
          flex: isMobile ? "initial" : 1,
          maxWidth: isMobile ? "100%" : isTablet ? "310px" : "450px",
          width: "100%",
          minWidth: 0,
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            background: "#ffffff",
            borderBottom: searchFocused
              ? "2px solid #0d9488"
              : "1px solid #e2e8f0",
            borderTop: "1px solid #e2e8f0",
            borderLeft: "1px solid #e2e8f0",
            borderRight: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
            borderRadius: showDropdown ? "12px 12px 0 0" : "13px",
            padding: isMobile ? "4px 6px 4px 12px" : "5px 8px 5px 14px",
            boxSizing: "border-box",
            gap: "6px",
            transition: "border-color 0.15s ease",
          }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              setSearchFocused(true);
              if (searchQuery.trim()) setDropdownOpen(true);
            }}
            onBlur={() => setSearchFocused(false)}
            placeholder="ঔষধ বা কোম্পানির নাম সার্চ..."
            aria-label="Search medicine or company"
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: isMobile ? "13.5px" : "15px",
              fontWeight: "400",
              color: "#1e293b",
              padding: isMobile ? "5px 2px" : "6px 2px",
            }}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              style={{
                background: "#f1f5f9",
                color: "#475569",
                border: "none",
                borderRadius: "50%",
                width: "22px",
                height: "22px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          )}
        </form>

        {/* Clean List Dropdown Matching Reference Image */}
        {showDropdown && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderTop: "none",
              borderRadius: "0 0 12px 12px",
              boxShadow: "0 18px 30px -10px rgba(15, 23, 42, 0.22)",
              maxHeight: isMobile ? "260px" : "380px",
              overflowY: "auto",
              padding: "6px 0",
              zIndex: 1500,
            }}
          >
            {matchedMedicines.length > 0 ? (
              matchedMedicines.map((med, idx) => {
                const { baseName, strength } = splitMedicineNameAndDosage(
                  med.name
                );
                const isHovered = hoveredIndex === idx;

                return (
                  <button
                    type="button"
                    key={med._id || med.id || idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(-1)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(med);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: "10px",
                      padding: isMobile ? "8px 12px" : "9px 16px",
                      border: "none",
                      background: isHovered ? "#f0fdfa" : "#ffffff",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.12s ease",
                    }}
                  >
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: 1.35,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: isMobile ? "14px" : "15.5px",
                          fontWeight: "400",
                          color: "#149188",
                        }}
                      >
                        {baseName}
                      </span>
                      {strength && (
                        <span
                          style={{
                            marginLeft: "5px",
                            fontSize: isMobile ? "11px" : "12px",
                            fontWeight: "400",
                            color: "#4db6ac",
                          }}
                        >
                          {strength}
                        </span>
                      )}
                    </span>

                    {med.company && (
                      <span
                        style={{
                          fontSize: isMobile ? "10px" : "11px",
                          fontWeight: "500",
                          color: "#94a3b8",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          maxWidth: isMobile ? "36%" : "45%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {med.company}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div
                style={{
                  padding: "14px 16px",
                  fontSize: "13px",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                &ldquo;{searchQuery.trim()}&rdquo; এর সাথে মিলে এমন কোনো ঔষধ
                পাওয়া যায়নি।
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop / Tablet Requested Notification Button */}
      {!isMobile && (
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => router.push("/requested")}
            onMouseEnter={() => setHoveredBtn(true)}
            onMouseLeave={() => setHoveredBtn(false)}
            style={{
              background: hoveredBtn
                ? "#ffffff"
                : "rgba(255, 255, 255, 0.14)",
              border: hoveredBtn
                ? "1px solid #ffffff"
                : "1px solid rgba(255, 255, 255, 0.3)",
              padding: isTablet ? "9px 12px" : "10px 15px",
              borderRadius: "14px",
              cursor: "pointer",
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              justifyContent: "center",
              transition: "all 0.2s ease",
              boxShadow: hoveredBtn
                ? "0 10px 20px -4px rgba(0, 0, 0, 0.25)"
                : "0 4px 10px rgba(0, 0, 0, 0.12)",
            }}
            title="Requested Medicines"
            aria-label="Requested Medicines"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke={hoveredBtn ? "#1d4ed8" : "#ffffff"}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>

            {!isTablet && (
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: hoveredBtn ? "#0f172a" : "#ffffff",
                  whiteSpace: "nowrap",
                }}
              >
                Requested
              </span>
            )}

            {missingList.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "#ffffff",
                  fontSize: "11px",
                  minWidth: "20px",
                  height: "20px",
                  padding: "0 5px",
                  borderRadius: "999px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(220, 38, 38, 0.45)",
                  border: "2px solid #0f172a",
                  boxSizing: "border-box",
                }}
              >
                {missingList.length}
              </span>
            )}
          </button>
        </div>
      )}
    </nav>
  );
}