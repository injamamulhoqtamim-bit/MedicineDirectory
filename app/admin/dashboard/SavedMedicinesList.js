"use client";
import { DeleteMedicineButton } from "./DeleteMedicineAction";

export default function SavedMedicinesList({
  isMobile,
  selectedCompany,
  companyMedicines,
  visibleMedicines,
  isSearching,
  activeMedicineSearch,
  savedMedicineQuery,
  setSavedMedicineQuery,
  setActiveMedicineSearch,
  handleSavedMedicineSearch,
  handleClearSavedMedicineSearch,
  loadingList,
  handleEditClick,
  openDeleteModal,
}) {
  const formatAlternativeList = (med) => {
    if (Array.isArray(med?.alternativeBrands) && med.alternativeBrands.length > 0) {
      return med.alternativeBrands
        .filter((item) => item && (item.name || item.company))
        .map((item) =>
          item.company ? `${item.name || "Brand"} (${item.company})` : item.name
        );
    }
    if (typeof med?.alternativeBrand === "string" && med.alternativeBrand.trim()) {
      return [med.alternativeBrand.trim()];
    }
    return [];
  };

  return (
    <div
      style={{
        background: "white",
        padding: isMobile ? "16px" : "28px",
        borderRadius: isMobile ? "18px" : "22px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 12px 28px -12px rgba(15, 23, 42, 0.08)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "#0f172a",
            fontSize: isMobile ? "16px" : "18px",
            fontWeight: "800",
            lineHeight: "1.4",
            wordBreak: "break-word",
          }}
        >
          Saved Medicines in {selectedCompany} ({visibleMedicines.length}
          {isSearching ? ` / ${companyMedicines.length}` : ""})
        </h3>
      </div>

      {/* Search Box + Search Button for Saved Medicines in Selected Company */}
      <form
        onSubmit={handleSavedMedicineSearch}
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "8px",
          marginBottom: "16px",
          alignItems: "stretch",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <input
            type="text"
            placeholder={`${selectedCompany}-এর ওষুধ খুঁজুন (নাম, ব্যবহার, প্রাইস, Alternative Brand)...`}
            value={savedMedicineQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSavedMedicineQuery(val);
              if (typeof setActiveMedicineSearch === "function") {
                setActiveMedicineSearch(val.trim());
              }
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: savedMedicineQuery
                ? "10px 36px 10px 14px"
                : "10px 14px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              outline: "none",
              fontSize: isMobile ? "13.5px" : "14px",
              color: "#0f172a",
            }}
          />
          {savedMedicineQuery && (
            <button
              type="button"
              onClick={handleClearSavedMedicineSearch}
              aria-label="Clear saved medicine search"
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "#e2e8f0",
                color: "#334155",
                border: "none",
                borderRadius: "50%",
                width: "22px",
                height: "22px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <button
            type="submit"
            style={{
              flex: isMobile ? 1 : "initial",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "13.5px",
              fontWeight: "700",
              boxShadow: "0 6px 14px -4px rgba(37, 99, 235, 0.35)",
              whiteSpace: "nowrap",
            }}
          >
            🔍 Search
          </button>

          {isSearching && (
            <button
              type="button"
              onClick={handleClearSavedMedicineSearch}
              style={{
                background: "#f1f5f9",
                color: "#334155",
                border: "1px solid #cbd5e1",
                padding: "10px 14px",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "700",
                whiteSpace: "nowrap",
              }}
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {loadingList ? (
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          Loading...
        </p>
      ) : companyMedicines.length === 0 ? (
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          Ei company-r kono medicine database-e nei.
        </p>
      ) : visibleMedicines.length === 0 ? (
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          &ldquo;{activeMedicineSearch}&rdquo; লিখে {selectedCompany}-এ কোনো ওষুধ
          পাওয়া যায়নি।
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {visibleMedicines.map((med) => {
            const altList = formatAlternativeList(med);

            return (
              <div
                key={med._id}
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "stretch" : "center",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  gap: "12px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    minWidth: 0,
                  }}
                >
                  {med.image && (
                    <img
                      src={med.image}
                      alt={med.name}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      style={{
                        width: "52px",
                        height: "52px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <strong
                      style={{
                        color: "#0f172a",
                        fontSize: "15px",
                        fontWeight: "700",
                        display: "block",
                        wordBreak: "break-word",
                      }}
                    >
                      {med.name}
                    </strong>
                    <div
                      style={{
                        color: "#2563eb",
                        fontSize: "12px",
                        fontWeight: "600",
                        wordBreak: "break-word",
                        marginTop: "2px",
                      }}
                    >
                      {med.company}
                    </div>
                    {(med.unitPrice || med.stripPrice || med.boxPrice) && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                          marginTop: "6px",
                          fontSize: "11.5px",
                          fontWeight: "700",
                        }}
                      >
                        {med.unitPrice && (
                          <span
                            style={{
                              background: "#eff6ff",
                              color: "#1d4ed8",
                              padding: "2px 8px",
                              borderRadius: "999px",
                            }}
                          >
                            Unit: {med.unitPrice}
                          </span>
                        )}
                        {med.stripPrice && (
                          <span
                            style={{
                              background: "#ecfdf5",
                              color: "#047857",
                              padding: "2px 8px",
                              borderRadius: "999px",
                            }}
                          >
                            Strip: {med.stripPrice}
                          </span>
                        )}
                        {med.boxPrice && (
                          <span
                            style={{
                              background: "#fef3c7",
                              color: "#b45309",
                              padding: "2px 8px",
                              borderRadius: "999px",
                            }}
                          >
                            Box: {med.boxPrice}
                          </span>
                        )}
                      </div>
                    )}
                    {med.uses && (
                      <div
                        style={{
                          color: "#475569",
                          fontSize: "12.5px",
                          marginTop: "4px",
                          lineHeight: "1.4",
                          wordBreak: "break-word",
                        }}
                      >
                        💊 {med.uses}
                      </div>
                    )}
                    {altList.length > 0 && (
                      <div
                        style={{
                          color: "#0f766e",
                          fontSize: "12.5px",
                          fontWeight: "600",
                          marginTop: "4px",
                          lineHeight: "1.45",
                          wordBreak: "break-word",
                        }}
                      >
                        🔄 Alternative Brands: {altList.join(" • ")}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: isMobile ? "flex-end" : "flex-start",
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleEditClick(med)}
                    style={{
                      flex: isMobile ? 1 : "initial",
                      background: "#dbeafe",
                      color: "#1d4ed8",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "700",
                    }}
                  >
                    Edit
                  </button>

                  <DeleteMedicineButton
                    id={med._id}
                    name={med.name}
                    onOpenDeleteModal={openDeleteModal}
                    isMobile={isMobile}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}