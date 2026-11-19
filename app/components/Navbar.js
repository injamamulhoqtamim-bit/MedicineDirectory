"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [missingList, setMissingList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [viewport, setViewport] = useState("desktop"); // "mobile" | "tablet" | "desktop"
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

  const broadcastSearch = (val) => {
    sessionStorage.setItem("medicineSearchTerm", val);
    window.dispatchEvent(new CustomEvent("navbarSearch", { detail: val }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    broadcastSearch(value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    broadcastSearch(searchQuery);
    if (pathname !== "/") {
      const trimmed = searchQuery.trim();
      router.push(trimmed ? `/?search=${encodeURIComponent(trimmed)}` : "/");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    broadcastSearch("");
  };

  // যদি রুটটি /admin দিয়ে শুরু হয়, তবে Navbar দেখাবে না
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  const isMobile = viewport === "mobile";
  const isTablet = viewport === "tablet";

  const renderBrandLogo = () => (
    <button
      type="button"
      onClick={() => {
        handleClearSearch();
        router.push("/");
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? "9px" : "11px",
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
          width: isMobile ? "36px" : "42px",
          height: isMobile ? "36px" : "42px",
          borderRadius: isMobile ? "11px" : "13px",
          background:
            "linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #0ea5e9 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            "0 8px 18px -4px rgba(37, 99, 235, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          flexShrink: 0,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={isMobile ? "20" : "23"}
          height={isMobile ? "20" : "23"}
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
            background:
              "linear-gradient(135deg, #0f172a 0%, #1d4ed8 65%, #0284c7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: isMobile ? "15px" : isTablet ? "17.5px" : "19.5px",
            fontWeight: "800",
            letterSpacing: "-0.025em",
            whiteSpace: "nowrap",
          }}
        >
          Sheikh Drugs Pharma
        </span>
        {!isMobile && (
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: "700",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#475569",
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
        padding: isMobile ? "10px 12px" : isTablet ? "12px 18px" : "13px 24px",
        background:
          "linear-gradient(135deg, rgba(240, 249, 255, 0.96) 0%, rgba(239, 246, 255, 0.95) 50%, rgba(248, 250, 252, 0.97) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow:
          "0 14px 30px -8px rgba(29, 78, 216, 0.12), 0 4px 12px -4px rgba(15, 23, 42, 0.05)",
        borderRadius: isMobile ? "15px" : "20px",
        marginTop: isMobile ? "8px" : "14px",
        marginBottom: isMobile ? "12px" : "20px",
        position: "sticky",
        top: isMobile ? "8px" : "14px",
        zIndex: 1000,
        border: "1px solid rgba(191, 219, 254, 0.9)",
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
                background: "#ffffff",
                border: "1px solid #bfdbfe",
                padding: "8px 9px",
                borderRadius: "11px",
                cursor: "pointer",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 8px rgba(37, 99, 235, 0.08)",
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
                stroke="#1d4ed8"
                strokeWidth="2.1"
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
                    color: "white",
                    fontSize: "10.5px",
                    minWidth: "19px",
                    height: "19px",
                    padding: "0 4px",
                    borderRadius: "999px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #ffffff",
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

      {/* Navbar Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          flex: isMobile ? "initial" : 1,
          maxWidth: isMobile ? "100%" : isTablet ? "320px" : "450px",
          width: "100%",
          minWidth: 0,
          background: searchFocused ? "#ffffff" : "rgba(255, 255, 255, 0.88)",
          border: searchFocused ? "1px solid #2563eb" : "1px solid #bfdbfe",
          boxShadow: searchFocused
            ? "0 0 0 3px rgba(37, 99, 235, 0.16)"
            : "0 2px 6px rgba(15, 23, 42, 0.03)",
          borderRadius: "13px",
          padding: isMobile ? "3px 5px 3px 10px" : "4px 6px 4px 12px",
          boxSizing: "border-box",
          gap: "6px",
          transition: "all 0.2s ease",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke={searchFocused ? "#2563eb" : "#475569"}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>

        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="ঔষধ বা কোম্পানির নাম সার্চ..."
          aria-label="Search medicine or company"
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: isMobile ? "13px" : "14px",
            color: "#0f172a",
            padding: isMobile ? "5px 2px" : "6px 2px",
          }}
        />

        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            aria-label="Clear search"
            style={{
              background: "#dbeafe",
              color: "#1d4ed8",
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

        <button
          type="submit"
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            padding: isMobile ? "6px 11px" : "7px 15px",
            fontSize: isMobile ? "12px" : "12.5px",
            fontWeight: "600",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            boxShadow: "0 4px 10px -2px rgba(37, 99, 235, 0.35)",
          }}
        >
          Search
        </button>
      </form>

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
                ? "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
                : "#ffffff",
              border: hoveredBtn ? "1px solid #60a5fa" : "1px solid #bfdbfe",
              padding: isTablet ? "9px 11px" : "10px 14px",
              borderRadius: "14px",
              cursor: "pointer",
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              justifyContent: "center",
              transition: "all 0.2s ease",
              boxShadow: hoveredBtn
                ? "0 8px 18px -4px rgba(37, 99, 235, 0.25)"
                : "0 2px 6px rgba(37, 99, 235, 0.08)",
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
              stroke={hoveredBtn ? "#1d4ed8" : "#2563eb"}
              strokeWidth="2.1"
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
                  color: hoveredBtn ? "#1e40af" : "#1e293b",
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
                  color: "white",
                  fontSize: "11px",
                  minWidth: "20px",
                  height: "20px",
                  padding: "0 5px",
                  borderRadius: "999px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(220, 38, 38, 0.35)",
                  border: "2px solid #ffffff",
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