"use client";

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
  const sidebarBody = (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          gap: "8px",
          paddingBottom: "14px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: 0,
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
                fontSize: "14.5px",
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
        </div>

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
              padding: "9px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "13.5px",
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
      <div style={{ marginBottom: "14px", position: "relative" }}>
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

      {/* Company List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          overflowY: "auto",
          flex: 1,
          paddingRight: "2px",
        }}
      >
        <p
          style={{
            fontSize: "11.5px",
            fontWeight: "700",
            color: "#64748b",
            margin: "2px 0 6px 0",
            letterSpacing: "0.03em",
          }}
        >
          COMPANIES ({filteredCompanies.length})
        </p>
        {filteredCompanies.map((comp, index) => {
          const isActive = selectedCompany === comp;
          const countForComp = medicines.filter(
            (m) => m.company === comp
          ).length;

          return (
            <button
              type="button"
              key={index}
              onClick={() => {
                setSelectedCompany(comp);
                setSavedMedicineQuery("");
                setActiveMedicineSearch("");
                if (!editingId) {
                  setSelectedMedicineName("");
                }
                if (isMobile) {
                  setMobileSidebarOpen(false);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                textAlign: "left",
                padding: "9px 11px",
                borderRadius: "10px",
                border: isActive ? "1px solid #bfdbfe" : "1px solid transparent",
                background: isActive
                  ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                  : "transparent",
                color: isActive ? "#1d4ed8" : "#334155",
                fontWeight: isActive ? "700" : "500",
                cursor: "pointer",
                fontSize: "12.5px",
                transition: "all 0.15s ease",
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
          );
        })}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      {isMobile && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid #e2e8f0",
            padding: "10px 14px",
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
              padding: "8px 11px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "12.5px",
              fontWeight: "700",
              flexShrink: 0,
            }}
          >
            ☰ Companies
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: 0,
              flex: 1,
              justifyContent: "center",
            }}
          >
            {emblem}
            <div
              style={{
                fontSize: "13px",
                fontWeight: "800",
                color: "#0f172a",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              🏢 {selectedCompany}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
              color: "#dc2626",
              border: "1px solid #fca5a5",
              padding: "9px 15px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "700",
              boxShadow: "0 6px 14px -4px rgba(220, 38, 38, 0.22)",
              flexShrink: 0,
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
              padding: "18px",
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

      {/* Desktop / Tablet Left Sidebar */}
      {!isMobile && (
        <aside
          style={{
            width: isTablet ? "275px" : "315px",
            minWidth: isTablet ? "255px" : "295px",
            background: "white",
            borderRight: "1px solid #e2e8f0",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            position: "sticky",
            top: 0,
            boxSizing: "border-box",
            flexShrink: 0,
            boxShadow: "4px 0 20px -12px rgba(15, 23, 42, 0.08)",
          }}
        >
          {sidebarBody}
        </aside>
      )}
    </>
  );
}