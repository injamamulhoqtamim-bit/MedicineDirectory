"use client";
import { useState, useEffect, useCallback } from "react";

const CUSTOM_COMPANIES_STORAGE_KEY = "sheikhDrugsCustomCompanies";
const DELETED_COMPANIES_STORAGE_KEY = "sheikhDrugsDeletedCompanies";

function readStringArray(key) {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export default function LeftSidebar({
  emblem,
  searchTerm,
  setSearchTerm,
  filteredCompanies,
  selectedCompany,
  setSelectedCompany,
  setSavedMedicineQuery,
  setActiveMedicineSearch,
  setSelectedMedicineName,
  editingId,
  medicines,
  isMobile,
  isTablet,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  handleLogout,
}) {
  const sidebarWidth = isTablet ? 265 : 315;

  const [customCompanies, setCustomCompanies] = useState([]);
  const [deletedCompanies, setDeletedCompanies] = useState([]);
  const [showAddCompanyInput, setShowAddCompanyInput] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [companyError, setCompanyError] = useState("");
  const [pendingDeleteCompany, setPendingDeleteCompany] = useState("");

  const syncFromStorage = useCallback(() => {
    setCustomCompanies(readStringArray(CUSTOM_COMPANIES_STORAGE_KEY));
    setDeletedCompanies(readStringArray(DELETED_COMPANIES_STORAGE_KEY));
  }, []);

  useEffect(() => {
    syncFromStorage();
    window.addEventListener("companiesUpdated", syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener("companiesUpdated", syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [syncFromStorage]);

  const deletedSet = new Set(
    deletedCompanies.map((c) => c.toLowerCase().trim())
  );

  const combinedCompanies = (() => {
    const q = String(searchTerm || "").trim().toLowerCase();
    const seen = new Set();
    const result = [];

    const addIfValid = (rawComp) => {
      const comp = String(rawComp || "").trim();
      if (!comp) return;
      const key = comp.toLowerCase();
      if (deletedSet.has(key) || seen.has(key)) return;
      if (q && !key.includes(q)) return;
      seen.add(key);
      result.push(comp);
    };

    // 1. Admin থেকে যুক্ত করা custom কোম্পানিগুলো সবার আগে
    for (const comp of customCompanies) {
      addIfValid(comp);
    }

    // 2. Parent থেকে আসা filteredCompanies
    if (Array.isArray(filteredCompanies)) {
      for (const comp of filteredCompanies) {
        addIfValid(comp);
      }
    }

    // 3. ডাটাবেসের ওষুধের কোম্পানিগুলো
    if (Array.isArray(medicines)) {
      for (const med of medicines) {
        addIfValid(med?.company);
      }
    }

    return result;
  })();

  useEffect(() => {
    if (!selectedCompany && combinedCompanies.length > 0) {
      setSelectedCompany(combinedCompanies[0]);
    }
  }, [selectedCompany, combinedCompanies, setSelectedCompany]);

  const handleSelectCompany = (comp) => {
    setSelectedCompany(comp);
    if (typeof setSavedMedicineQuery === "function") {
      setSavedMedicineQuery("");
    }
    if (typeof setActiveMedicineSearch === "function") {
      setActiveMedicineSearch("");
    }
    if (!editingId && typeof setSelectedMedicineName === "function") {
      setSelectedMedicineName("");
    }
    if (isMobile && typeof setMobileSidebarOpen === "function") {
      setMobileSidebarOpen(false);
    }
  };

  const handleRequestDeleteCompany = (e, compToDelete) => {
    e.preventDefault();
    e.stopPropagation();
    setPendingDeleteCompany(compToDelete);
  };

  const handleConfirmDeleteCompany = () => {
    const compToDelete = pendingDeleteCompany;
    if (!compToDelete) return;

    const normalized = String(compToDelete).toLowerCase().trim();
    const updatedCustom = customCompanies.filter(
      (c) => c.toLowerCase().trim() !== normalized
    );
    setCustomCompanies(updatedCustom);

    const updatedDeleted = deletedCompanies.some(
      (c) => c.toLowerCase().trim() === normalized
    )
      ? deletedCompanies
      : [...deletedCompanies, compToDelete];
    setDeletedCompanies(updatedDeleted);

    try {
      localStorage.setItem(
        CUSTOM_COMPANIES_STORAGE_KEY,
        JSON.stringify(updatedCustom)
      );
      localStorage.setItem(
        DELETED_COMPANIES_STORAGE_KEY,
        JSON.stringify(updatedDeleted)
      );
      window.dispatchEvent(new Event("companiesUpdated"));
    } catch {
      // ignore storage quota errors
    }

    const remaining = combinedCompanies.filter(
      (c) => c.toLowerCase().trim() !== normalized
    );

    if (selectedCompany === compToDelete) {
      const nextComp =
        remaining[0] ||
        (Array.isArray(medicines) && medicines[0]?.company) ||
        "";
      setSelectedCompany(nextComp);
      if (typeof setSavedMedicineQuery === "function") {
        setSavedMedicineQuery("");
      }
      if (typeof setActiveMedicineSearch === "function") {
        setActiveMedicineSearch("");
      }
    }

    setPendingDeleteCompany("");
  };

  const handleAddCompany = (e) => {
    if (e) e.preventDefault();
    const trimmed = newCompanyName.trim();
    if (!trimmed) {
      setCompanyError("কোম্পানির নাম লিখুন");
      return;
    }

    const normalized = trimmed.toLowerCase();
    const nextDeleted = deletedCompanies.filter(
      (c) => c.toLowerCase().trim() !== normalized
    );
    setDeletedCompanies(nextDeleted);

    const allExisting = [
      ...(Array.isArray(filteredCompanies) ? filteredCompanies : []),
      ...customCompanies,
    ];
    const alreadyExists = allExisting.find(
      (item) => item.toLowerCase().trim() === normalized
    );

    const updatedCustom = alreadyExists
      ? customCompanies
      : [trimmed, ...customCompanies];
    setCustomCompanies(updatedCustom);

    try {
      localStorage.setItem(
        CUSTOM_COMPANIES_STORAGE_KEY,
        JSON.stringify(updatedCustom)
      );
      localStorage.setItem(
        DELETED_COMPANIES_STORAGE_KEY,
        JSON.stringify(nextDeleted)
      );
      window.dispatchEvent(new Event("companiesUpdated"));
    } catch {
      // ignore storage quota errors
    }

    setNewCompanyName("");
    setCompanyError("");
    setShowAddCompanyInput(false);
    handleSelectCompany(alreadyExists || trimmed);
  };

  const handleBrandClick = () => {
    const defaultCompany =
      combinedCompanies[0] ||
      (Array.isArray(medicines) && medicines[0]?.company) ||
      selectedCompany ||
      "";

    if (defaultCompany) {
      setSelectedCompany(defaultCompany);
    }
    if (typeof setSearchTerm === "function") {
      setSearchTerm("");
    }
    if (typeof setSavedMedicineQuery === "function") {
      setSavedMedicineQuery("");
    }
    if (typeof setActiveMedicineSearch === "function") {
      setActiveMedicineSearch("");
    }
    if (!editingId && typeof setSelectedMedicineName === "function") {
      setSelectedMedicineName("");
    }
    if (isMobile && typeof setMobileSidebarOpen === "function") {
      setMobileSidebarOpen(false);
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const sidebarBody = (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
          gap: "8px",
          paddingBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={handleBrandClick}
          title="Back to top of Admin Dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: 0,
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {emblem}
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                background:
                  "linear-gradient(135deg, #0f172a 0%, #1d4ed8 70%, #2563eb 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: isTablet ? "13.5px" : "14.5px",
                fontWeight: "800",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Sheikh Drugs Pharma
            </h2>
            <span
              style={{
                display: "block",
                fontSize: "10.5px",
                fontWeight: "700",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#64748b",
                marginTop: "2px",
              }}
            >
              Admin Dashboard
            </span>
          </div>
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
              color: "#dc2626",
              border: "1px solid #fca5a5",
              padding: isTablet ? "7px 11px" : "9px 15px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: isTablet ? "12px" : "13px",
              fontWeight: "700",
              boxShadow: "0 6px 14px -4px rgba(220, 38, 38, 0.25)",
              transition: "all 0.18s ease",
              whiteSpace: "nowrap",
            }}
          >
            Logout
          </button>
          {isMobile && (
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close company list"
              style={{
                background: "#f1f5f9",
                color: "#334155",
                border: "1px solid #cbd5e1",
                padding: "8px 11px",
                borderRadius: "11px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search Input in Left Sidebar */}
      <div style={{ marginBottom: "12px", position: "relative", flexShrink: 0 }}>
        <input
          type="text"
          placeholder="🔍 Search company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 34px 10px 12px",
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            background: "#f8fafc",
            outline: "none",
            fontSize: "13.5px",
            color: "#0f172a",
          }}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            aria-label="Clear company search"
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "#e2e8f0",
              color: "#334155",
              border: "none",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Company List Header + Plus Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "2px 0 6px 0",
          paddingBottom: "4px",
          borderBottom: "1px solid #f1f5f9",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: "11.5px",
            fontWeight: "700",
            color: "#64748b",
            margin: 0,
            letterSpacing: "0.03em",
          }}
        >
          COMPANIES ({combinedCompanies.length})
        </p>

        <button
          type="button"
          onClick={() => {
            setShowAddCompanyInput((prev) => !prev);
            setCompanyError("");
          }}
          title="Add new company"
          aria-label="Add new company"
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "8px",
            border: "1px solid #bfdbfe",
            background: showAddCompanyInput
              ? "#2563eb"
              : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            color: showAddCompanyInput ? "#ffffff" : "#1d4ed8",
            fontSize: "16px",
            fontWeight: "800",
            lineHeight: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s ease",
            flexShrink: 0,
          }}
        >
          {showAddCompanyInput ? "−" : "+"}
        </button>
      </div>

      {/* Add Company Input Box (Opens when + is clicked) */}
      {showAddCompanyInput && (
        <form
          onSubmit={handleAddCompany}
          style={{
            marginBottom: "10px",
            padding: "10px",
            borderRadius: "12px",
            background: "#f8fafc",
            border: "1px solid #cbd5e1",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              type="text"
              value={newCompanyName}
              onChange={(e) => {
                setNewCompanyName(e.target.value);
                if (companyError) setCompanyError("");
              }}
              placeholder="নতুন কোম্পানির নাম..."
              autoFocus
              style={{
                flex: 1,
                minWidth: 0,
                padding: "8px 10px",
                borderRadius: "9px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                outline: "none",
                fontSize: "12.5px",
                color: "#0f172a",
                boxSizing: "border-box",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 12px",
                borderRadius: "9px",
                border: "none",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Add
            </button>
          </div>
          {companyError && (
            <div
              style={{
                marginTop: "5px",
                fontSize: "11px",
                fontWeight: "600",
                color: "#dc2626",
              }}
            >
              {companyError}
            </div>
          )}
        </form>
      )}

      {/* Company List (Scrollable inside fixed sidebar) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          overflowY: "auto",
          overscrollBehavior: "contain",
          flex: 1,
          minHeight: 0,
          paddingRight: "2px",
        }}
      >
        {combinedCompanies.length === 0 ? (
          <div
            style={{
              padding: "16px 12px",
              borderRadius: "12px",
              background: "#f8fafc",
              border: "1px dashed #cbd5e1",
              textAlign: "center",
              fontSize: "12px",
              color: "#64748b",
              lineHeight: "1.5",
            }}
          >
            কোনো কোম্পানি যোগ করা হয়নি। উপরে{" "}
            <strong style={{ color: "#1d4ed8" }}>+</strong> বাটনে ক্লিক করে
            কোম্পানি যুক্ত করুন।
          </div>
        ) : (
          combinedCompanies.map((comp, index) => {
            const isActive = selectedCompany === comp;
            const countForComp = Array.isArray(medicines)
              ? medicines.filter((m) => m.company === comp).length
              : 0;

            return (
              <div
                key={`${comp}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "4px",
                  padding: "4px 6px 4px 4px",
                  borderRadius: "10px",
                  border: isActive
                    ? "1px solid #bfdbfe"
                    : "1px solid transparent",
                  background: isActive
                    ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                    : "transparent",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  onClick={() => handleSelectCompany(comp)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    textAlign: "left",
                    padding: "5px 6px",
                    borderRadius: "8px",
                    border: "none",
                    background: "transparent",
                    color: isActive ? "#1d4ed8" : "#334155",
                    fontWeight: isActive ? "700" : "500",
                    cursor: "pointer",
                    fontSize: "12.5px",
                    lineHeight: "1.35",
                  }}
                >
                  <span style={{ minWidth: 0, wordBreak: "break-word" }}>
                    🏢 {comp}
                  </span>
                  {countForComp > 0 && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "2px 7px",
                        borderRadius: "999px",
                        background: isActive ? "#2563eb" : "#e2e8f0",
                        color: isActive ? "#ffffff" : "#475569",
                        flexShrink: 0,
                      }}
                    >
                      {countForComp}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleRequestDeleteCompany(e, comp)}
                  title={`Delete ${comp}`}
                  aria-label={`Delete ${comp}`}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "7px",
                    border: "1px solid transparent",
                    background: "transparent",
                    color: "#94a3b8",
                    fontSize: "12px",
                    fontWeight: "700",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fee2e2";
                    e.currentTarget.style.color = "#dc2626";
                    e.currentTarget.style.borderColor = "#fca5a5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#94a3b8";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Top Confirm Pop-up Notification when ✕ is clicked */}
      {pendingDeleteCompany && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete company"
          style={{
            position: "fixed",
            top: "18px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2600,
            width: "min(440px, calc(100vw - 24px))",
            background: "#0f172a",
            color: "#ffffff",
            border: "1px solid rgba(248, 113, 113, 0.55)",
            borderRadius: "16px",
            padding: "14px 16px",
            boxShadow:
              "0 20px 35px -8px rgba(15, 23, 42, 0.45), 0 8px 16px -6px rgba(220, 38, 38, 0.25)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#fca5a5",
                  marginBottom: "4px",
                }}
              >
                Confirm Delete
              </div>
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "1.45",
                  color: "#f8fafc",
                  wordBreak: "break-word",
                }}
              >
                আপনি কি{" "}
                <strong style={{ color: "#f87171" }}>
                  &ldquo;{pendingDeleteCompany}&rdquo;
                </strong>{" "}
                কোম্পানিটি ডিলিট করতে চান?
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPendingDeleteCompany("")}
              aria-label="Close delete confirmation"
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                padding: "2px 6px",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginTop: "12px",
            }}
          >
            <button
              type="button"
              onClick={() => setPendingDeleteCompany("")}
              style={{
                padding: "7px 12px",
                borderRadius: "10px",
                border: "1px solid #475569",
                background: "#1e293b",
                color: "#e2e8f0",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmDeleteCompany}
              style={{
                padding: "7px 14px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 6px 14px -4px rgba(220, 38, 38, 0.55)",
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Mobile Top Bar */}
      {isMobile && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            width: "100%",
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid #e2e8f0",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            boxSizing: "border-box",
          }}
        >
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            style={{
              background: "#eff6ff",
              color: "#2563eb",
              border: "1px solid #bfdbfe",
              padding: "8px 10px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "700",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            ☰ Companies
          </button>

          <button
            type="button"
            onClick={handleBrandClick}
            title="Back to top of Admin Dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              minWidth: 0,
              flex: 1,
              justifyContent: "center",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            {emblem}
            <div
              style={{
                fontSize: "12.5px",
                fontWeight: "800",
                color: "#0f172a",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Sheikh Drugs Pharma
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
              color: "#dc2626",
              border: "1px solid #fca5a5",
              padding: "8px 12px",
              borderRadius: "11px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "700",
              boxShadow: "0 6px 14px -4px rgba(220, 38, 38, 0.22)",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Logout
          </button>
        </div>
      )}

      {/* Mobile Drawer Sidebar */}
      {isMobile && mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1500,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(3px)",
            display: "flex",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "85%",
              maxWidth: "320px",
              height: "100%",
              background: "white",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              boxSizing: "border-box",
            }}
          >
            {sidebarBody}
          </div>
        </div>
      )}

      {/* Desktop / Tablet Fixed Left Sidebar + Layout Spacer */}
      {!isMobile && (
        <>
          <div
            aria-hidden="true"
            style={{
              width: `${sidebarWidth}px`,
              minWidth: `${sidebarWidth}px`,
              flexShrink: 0,
            }}
          />
          <aside
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: `${sidebarWidth}px`,
              height: "100vh",
              background: "white",
              borderRight: "1px solid #e2e8f0",
              padding: isTablet ? "16px" : "20px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxSizing: "border-box",
              zIndex: 30,
              boxShadow: "4px 0 20px -12px rgba(15, 23, 42, 0.08)",
            }}
          >
            {sidebarBody}
          </aside>
        </>
      )}
    </>
  );
}