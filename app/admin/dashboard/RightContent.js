"use client";

export default function RightContent({
  emblem,
  isMobile,
  isTablet,
  totalCompaniesCount,
  totalMedicinesCount,
  selectedCompany,
  companyMedicines,
  filteredCompanyMedicines,
  editingId,
  resetForm,
  successMsg,
  handleSave,
  selectedMedicineName,
  setSelectedMedicineName,
  unitPrice,
  setUnitPrice,
  stripPrice,
  setStripPrice,
  boxPrice,
  setBoxPrice,
  setImageFile,
  activePreviewImage,
  imageFile,
  existingImage,
  uses,
  setUses,
  dosage,
  setDosage,
  sideEffects,
  setSideEffects,
  uploading,
  savedMedicineQuery,
  setSavedMedicineQuery,
  activeMedicineSearch,
  setActiveMedicineSearch,
  handleSavedMedicineSearch,
  handleClearSavedMedicineSearch,
  loadingList,
  handleEditClick,
  openDeleteModal,
}) {
  const isSearching = activeMedicineSearch.trim().length > 0;
  const visibleMedicines = isSearching ? filteredCompanyMedicines : companyMedicines;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        padding: isMobile ? "14px" : isTablet ? "22px" : "30px 32px",
        boxSizing: "border-box",
        maxWidth: "1120px",
        width: "100%",
        margin: "0 auto",
      }}
    >
      {/* Premium Brand Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid #e2e8f0",
          borderRadius: isMobile ? "16px" : "20px",
          padding: isMobile ? "14px 16px" : "18px 24px",
          marginBottom: isMobile ? "14px" : "20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          boxShadow: "0 8px 20px -10px rgba(15, 23, 42, 0.06)",
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
          {emblem}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: isMobile ? "15.5px" : "19px",
                fontWeight: "800",
                background:
                  "linear-gradient(135deg, #0f172a 0%, #1d4ed8 70%, #2563eb 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.2,
                wordBreak: "break-word",
              }}
            >
              Sheikh Drugs Pharma
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                fontWeight: "600",
                marginTop: "3px",
              }}
            >
              Medicine Directory Management Console
            </div>
          </div>
        </div>

        <span
          style={{
            background: "#eff6ff",
            color: "#1d4ed8",
            border: "1px solid #bfdbfe",
            padding: "6px 12px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: "700",
            whiteSpace: "nowrap",
          }}
        >
          🏢 {selectedCompany}
        </span>
      </div>

      {/* Top Summary Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
          gap: "12px",
          marginBottom: isMobile ? "16px" : "22px",
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "14px 16px",
            boxShadow: "0 6px 16px -8px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
            Total Companies
          </div>
          <div
            style={{
              fontSize: "21px",
              fontWeight: "800",
              color: "#0f172a",
              marginTop: "4px",
            }}
          >
            {totalCompaniesCount}
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "14px 16px",
            boxShadow: "0 6px 16px -8px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
            Total Saved Medicines
          </div>
          <div
            style={{
              fontSize: "21px",
              fontWeight: "800",
              color: "#2563eb",
              marginTop: "4px",
            }}
          >
            {totalMedicinesCount}
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "14px 16px",
            boxShadow: "0 6px 16px -8px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
            In Selected Company
          </div>
          <div
            style={{
              fontSize: "21px",
              fontWeight: "800",
              color: "#059669",
              marginTop: "4px",
            }}
          >
            {companyMedicines.length}
          </div>
        </div>
      </div>

      {/* Add / Edit Medicine Card */}
      <div
        style={{
          background: "white",
          padding: isMobile ? "16px" : "28px 32px",
          borderRadius: isMobile ? "18px" : "22px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 12px 28px -12px rgba(15, 23, 42, 0.08)",
          marginBottom: isMobile ? "16px" : "26px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "18px",
            paddingBottom: "14px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                fontSize: "11.5px",
                fontWeight: "700",
                padding: "3px 10px",
                borderRadius: "999px",
                background: editingId ? "#fef3c7" : "#eff6ff",
                color: editingId ? "#b45309" : "#2563eb",
                marginBottom: "6px",
              }}
            >
              {editingId ? "✏️ Edit Mode" : "➕ New Entry"}
            </span>
            <h2
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: isMobile ? "17.5px" : "22px",
                fontWeight: "800",
                lineHeight: "1.35",
                wordBreak: "break-word",
              }}
            >
              {editingId ? "Editing Medicine for: " : "Adding for: "}
              <span style={{ color: "#2563eb" }}>{selectedCompany}</span>
            </h2>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                background: "#f1f5f9",
                color: "#334155",
                border: "1px solid #cbd5e1",
                padding: "8px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>

        {successMsg && (
          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              border: "1px solid #86efac",
              padding: "12px 14px",
              borderRadius: "12px",
              marginBottom: "18px",
              fontSize: "13.5px",
              fontWeight: "600",
              lineHeight: "1.45",
            }}
          >
            {successMsg}
          </div>
        )}

        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          {/* Medicine Name */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "8px",
              }}
            >
              Medicine Name:
            </label>
            <input
              type="text"
              placeholder="Jemon: Napa 500mg, Seclo 20mg..."
              value={selectedMedicineName}
              onChange={(e) => setSelectedMedicineName(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                outline: "none",
                fontSize: isMobile ? "14px" : "15px",
                color: "#0f172a",
              }}
              required
            />
          </div>

          {/* Tiered Pricing Fields: Unit Price, Strip Price, Full Box Price */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13.5px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "8px",
                }}
              >
                Unit Price (৳):
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Jemon: 0.80 বা ৳0.80"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 13px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  outline: "none",
                  fontSize: isMobile ? "14px" : "14.5px",
                  color: "#0f172a",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13.5px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "8px",
                }}
              >
                Strip Price (৳):
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Jemon: 8.00 বা ৳8"
                value={stripPrice}
                onChange={(e) => setStripPrice(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 13px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  outline: "none",
                  fontSize: isMobile ? "14px" : "14.5px",
                  color: "#0f172a",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13.5px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "8px",
                }}
              >
                Full Box Price (৳):
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Jemon: 400 বা ৳400"
                value={boxPrice}
                onChange={(e) => setBoxPrice(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 13px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  outline: "none",
                  fontSize: isMobile ? "14px" : "14.5px",
                  color: "#0f172a",
                }}
              />
            </div>
          </div>

          {/* Direct Image File Upload + Preview */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "8px",
              }}
            >
              Upload Image from Phone/PC:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                fontSize: "13.5px",
              }}
            />

            {activePreviewImage && (
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <img
                  src={activePreviewImage}
                  alt="Medicine preview"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  style={{
                    width: "56px",
                    height: "56px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "#475569",
                    minWidth: 0,
                  }}
                >
                  <div style={{ fontWeight: "700", color: "#0f172a" }}>
                    {imageFile
                      ? `Selected: ${imageFile.name}`
                      : "Current saved image"}
                  </div>
                  {!imageFile && editingId && (
                    <div style={{ wordBreak: "break-all", marginTop: "2px" }}>
                      {existingImage}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Uses */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "8px",
              }}
            >
              কিসের জন্য খাওয়া হয় (Uses):
            </label>
            <textarea
              rows="3"
              placeholder="Likhe din kisher jonno khawa hoy..."
              value={uses}
              onChange={(e) => setUses(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                outline: "none",
                fontSize: isMobile ? "14px" : "15px",
                color: "#0f172a",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>

          {/* Dosage */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "8px",
              }}
            >
              খাওয়ার নিয়ম (Dosage):
            </label>
            <textarea
              rows="3"
              placeholder="Khabarer niyom likhun..."
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                outline: "none",
                fontSize: isMobile ? "14px" : "15px",
                color: "#0f172a",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>

          {/* Side Effects */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "8px",
              }}
            >
              পার্শ্বপ্রতিক্রিয়া (Side Effects):
            </label>
            <textarea
              rows="3"
              placeholder="Parsheprotikriya likhun..."
              value={sideEffects}
              onChange={(e) => setSideEffects(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                outline: "none",
                fontSize: isMobile ? "14px" : "15px",
                color: "#0f172a",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            style={{
              background: uploading
                ? "#93c5fd"
                : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "white",
              padding: "13px 24px",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "15px",
              cursor: uploading ? "not-allowed" : "pointer",
              alignSelf: isMobile ? "stretch" : "flex-start",
              boxShadow: "0 10px 20px -6px rgba(37, 99, 235, 0.4)",
            }}
          >
            {uploading
              ? "Uploading & Saving..."
              : editingId
              ? "Update Details"
              : "Save Details"}
          </button>
        </form>
      </div>

      {/* Saved Medicines List for Edit & Delete */}
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
              placeholder={`${selectedCompany}-এর ওষুধ খুঁজুন (নাম, ব্যবহার, প্রাইস)...`}
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
                background:
                  "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
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
            &ldquo;{activeMedicineSearch}&rdquo; লিখে {selectedCompany}-এ কোনো
            ওষুধ পাওয়া যায়নি।
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {visibleMedicines.map((med) => (
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
                  <button
                    type="button"
                    onClick={() => openDeleteModal(med._id, med.name)}
                    style={{
                      flex: isMobile ? 1 : "initial",
                      background: "#fee2e2",
                      color: "#dc2626",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "700",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}