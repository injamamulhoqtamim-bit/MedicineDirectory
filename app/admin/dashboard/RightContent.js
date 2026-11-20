"use client";
import MedicineFormCard from "./MedicineFormCard";
import SavedMedicinesList from "./SavedMedicinesList";

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
  alternativeBrands,
  setAlternativeBrands,
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
  const visibleMedicines = isSearching
    ? filteredCompanyMedicines
    : companyMedicines;

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

      {/* Add / Edit Medicine Form Component */}
      <MedicineFormCard
        isMobile={isMobile}
        selectedCompany={selectedCompany}
        editingId={editingId}
        resetForm={resetForm}
        successMsg={successMsg}
        handleSave={handleSave}
        selectedMedicineName={selectedMedicineName}
        setSelectedMedicineName={setSelectedMedicineName}
        unitPrice={unitPrice}
        setUnitPrice={setUnitPrice}
        stripPrice={stripPrice}
        setStripPrice={setStripPrice}
        boxPrice={boxPrice}
        setBoxPrice={setBoxPrice}
        setImageFile={setImageFile}
        activePreviewImage={activePreviewImage}
        imageFile={imageFile}
        existingImage={existingImage}
        uses={uses}
        setUses={setUses}
        dosage={dosage}
        setDosage={setDosage}
        sideEffects={sideEffects}
        setSideEffects={setSideEffects}
        alternativeBrands={alternativeBrands}
        setAlternativeBrands={setAlternativeBrands}
        uploading={uploading}
      />

      {/* Saved Medicines List Component */}
      <SavedMedicinesList
        isMobile={isMobile}
        selectedCompany={selectedCompany}
        companyMedicines={companyMedicines}
        visibleMedicines={visibleMedicines}
        isSearching={isSearching}
        activeMedicineSearch={activeMedicineSearch}
        savedMedicineQuery={savedMedicineQuery}
        setSavedMedicineQuery={setSavedMedicineQuery}
        setActiveMedicineSearch={setActiveMedicineSearch}
        handleSavedMedicineSearch={handleSavedMedicineSearch}
        handleClearSavedMedicineSearch={handleClearSavedMedicineSearch}
        loadingList={loadingList}
        handleEditClick={handleEditClick}
        openDeleteModal={openDeleteModal}
      />
    </div>
  );
}