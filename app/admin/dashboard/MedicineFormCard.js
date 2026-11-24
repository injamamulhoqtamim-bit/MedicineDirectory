"use client";

export default function MedicineFormCard({
  isMobile,
  selectedCompany,
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
  alternativeBrands,
  setAlternativeBrands,
  uploading,
}) {
  const safeAlternatives =
    Array.isArray(alternativeBrands) && alternativeBrands.length > 0
      ? alternativeBrands
      : [{ name: "", company: "" }];

  const handleAddAlternativeRow = () => {
    setAlternativeBrands((prev) => [
      ...(Array.isArray(prev) && prev.length > 0
        ? prev
        : [{ name: "", company: "" }]),
      { name: "", company: "" },
    ]);
  };

  const handleAlternativeChange = (index, field, value) => {
    setAlternativeBrands((prev) => {
      const base =
        Array.isArray(prev) && prev.length > 0
          ? prev
          : [{ name: "", company: "" }];
      return base.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      );
    });
  };

  const handleRemoveAlternativeRow = (index) => {
    setAlternativeBrands((prev) => {
      const base =
        Array.isArray(prev) && prev.length > 0
          ? prev
          : [{ name: "", company: "" }];
      if (base.length === 1) {
        return [{ name: "", company: "" }];
      }
      return base.filter((_, idx) => idx !== index);
    });
  };

  return (
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

        {/* Dynamic Alternative Brands + Company Name */}
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
            Alternative Brands:
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {safeAlternatives.map((alt, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : "minmax(0, 1fr) minmax(0, 1fr) auto",
                  gap: "8px",
                  alignItems: "center",
                  padding: isMobile ? "10px" : "0",
                  borderRadius: isMobile ? "12px" : "0",
                  background: isMobile ? "#f8fafc" : "transparent",
                  border: isMobile ? "1px solid #e2e8f0" : "none",
                }}
              >
                <input
                  type="text"
                  placeholder={`Alternative Brand ${idx + 1} (Jemon: Ace 500mg)`}
                  value={alt.name || ""}
                  onChange={(e) =>
                    handleAlternativeChange(idx, "name", e.target.value)
                  }
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

                <input
                  type="text"
                  placeholder="Company Name (Jemon: Beximco Pharma)"
                  value={alt.company || ""}
                  onChange={(e) =>
                    handleAlternativeChange(idx, "company", e.target.value)
                  }
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

                <button
                  type="button"
                  onClick={() => handleRemoveAlternativeRow(idx)}
                  title="Remove alternative row"
                  aria-label="Remove alternative row"
                  style={{
                    padding: "10px 12px",
                    borderRadius: "11px",
                    border: "1px solid #fecaca",
                    background: "#fef2f2",
                    color: "#dc2626",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    justifySelf: isMobile ? "flex-end" : "auto",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddAlternativeRow}
            title="Add another alternative brand"
            aria-label="Add another alternative brand"
            style={{
              marginTop: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 14px",
              borderRadius: "10px",
              border: "1px solid #bfdbfe",
              background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
              color: "#1d4ed8",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              alignSelf: isMobile ? "stretch" : "flex-start",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "15px", lineHeight: 1 }}>+</span>
            <span>Add Alternative</span>
          </button>
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
  );
}