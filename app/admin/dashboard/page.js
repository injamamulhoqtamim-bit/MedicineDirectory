"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CompanyList } from "../../data/medicines";
import LeftSidebar from "./LeftSidebar";
import RightContent from "./RightContent";
import { DeleteConfirmModal } from "./DeleteMedicineAction";

const EMPTY_ALTERNATIVE_ROW = [{ name: "", company: "" }];

const normalizeAlternativeRows = (med) => {
  if (Array.isArray(med?.alternativeBrands) && med.alternativeBrands.length > 0) {
    return med.alternativeBrands.map((item) => ({
      name: String(item?.name || ""),
      company: String(item?.company || ""),
    }));
  }
  if (typeof med?.alternativeBrand === "string" && med.alternativeBrand.trim()) {
    return [{ name: med.alternativeBrand.trim(), company: "" }];
  }
  return [{ name: "", company: "" }];
};

const renderPharmaEmblem = (size = 36) => (
  <span
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "11px",
      background:
        "linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #0ea5e9 100%)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow:
        "0 8px 18px -4px rgba(37, 99, 235, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.35)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      flexShrink: 0,
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={Math.round(size * 0.56)}
      height={Math.round(size * 0.56)}
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
);

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [savedMedicineQuery, setSavedMedicineQuery] = useState("");
  const [activeMedicineSearch, setActiveMedicineSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(CompanyList[0] || "");
  const [selectedMedicineName, setSelectedMedicineName] = useState("");

  // Form fields
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [stripPrice, setStripPrice] = useState("");
  const [boxPrice, setBoxPrice] = useState("");
  const [uses, setUses] = useState("");
  const [dosage, setDosage] = useState("");
  const [sideEffects, setSideEffects] = useState("");
  const [alternativeBrands, setAlternativeBrands] = useState(
    EMPTY_ALTERNATIVE_ROW
  );

  // Edit & list states
  const [medicines, setMedicines] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  // Responsive & UI states
  const [viewport, setViewport] = useState("desktop"); // "mobile" | "tablet" | "desktop"
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Premium Delete Pop-up & Toast states
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success" | "error", message: string }

  const router = useRouter();

  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      if (width < 860) {
        setViewport("mobile");
      } else {
        setMobileSidebarOpen(false);
        setViewport(width < 1100 ? "tablet" : "desktop");
      }
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const isMobile = viewport === "mobile";
  const isTablet = viewport === "tablet";

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev && prev.message === message ? null : prev));
    }, 3200);
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      router.push("/admin");
    }
  }, [router]);

  const fetchMedicines = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/medicines", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMedicines(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const filteredCompanies = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return CompanyList;
    return CompanyList.filter((comp) => comp.toLowerCase().includes(q));
  }, [searchTerm]);

  const companyMedicines = useMemo(() => {
    return medicines.filter((med) => med.company === selectedCompany);
  }, [medicines, selectedCompany]);

  const filteredCompanyMedicines = useMemo(() => {
    const q = activeMedicineSearch.trim().toLowerCase();
    if (!q) return companyMedicines;
    return companyMedicines.filter((med) => {
      const nameMatch = String(med.name || "").toLowerCase().includes(q);
      const usesMatch = String(med.uses || "").toLowerCase().includes(q);
      const dosageMatch = String(med.dosage || "").toLowerCase().includes(q);
      const unitMatch = String(med.unitPrice || "").toLowerCase().includes(q);
      const stripMatch = String(med.stripPrice || "").toLowerCase().includes(q);
      const boxMatch = String(med.boxPrice || "").toLowerCase().includes(q);
      const altArrayMatch = Array.isArray(med.alternativeBrands)
        ? med.alternativeBrands.some(
            (a) =>
              String(a?.name || "").toLowerCase().includes(q) ||
              String(a?.company || "").toLowerCase().includes(q)
          )
        : false;
      const altSingleMatch = String(med.alternativeBrand || "")
        .toLowerCase()
        .includes(q);

      return (
        nameMatch ||
        usesMatch ||
        dosageMatch ||
        unitMatch ||
        stripMatch ||
        boxMatch ||
        altArrayMatch ||
        altSingleMatch
      );
    });
  }, [companyMedicines, activeMedicineSearch]);

  const handleSavedMedicineSearch = (e) => {
    if (e) e.preventDefault();
    setActiveMedicineSearch(savedMedicineQuery.trim());
  };

  const handleClearSavedMedicineSearch = () => {
    setSavedMedicineQuery("");
    setActiveMedicineSearch("");
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedMedicineName("");
    setImageFile(null);
    setImagePreviewUrl("");
    setExistingImage("");
    setUnitPrice("");
    setStripPrice("");
    setBoxPrice("");
    setUses("");
    setDosage("");
    setSideEffects("");
    setAlternativeBrands([{ name: "", company: "" }]);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    router.push("/admin");
  };

  const handleEditClick = (med) => {
    setEditingId(med._id);
    setSelectedCompany(med.company || CompanyList[0] || "");
    setSelectedMedicineName(med.name || "");
    setExistingImage(med.image || "");
    setImageFile(null);
    setImagePreviewUrl("");
    setUnitPrice(med.unitPrice ?? "");
    setStripPrice(med.stripPrice ?? "");
    setBoxPrice(med.boxPrice ?? "");
    setUses(med.uses || "");
    setDosage(med.dosage || "");
    setSideEffects(med.sideEffects || "");
    setAlternativeBrands(normalizeAlternativeRows(med));
    setSuccessMsg("");
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDeleteModal = (id, name) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    setDeleting(true);

    try {
      const res = await fetch(`/api/medicines/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setMedicines((prev) => prev.filter((item) => item._id !== id));
        if (editingId === id) {
          resetForm();
        }
        setDeleteTarget(null);
        showToast("success", `"${name}" সফলভাবে ডিলিট করা হয়েছে!`);
      } else {
        setDeleteTarget(null);
        showToast("error", data.error || "ডিলিট করতে সমস্যা হয়েছে!");
      }
    } catch (err) {
      setDeleteTarget(null);
      showToast("error", "সার্ভারে ডিলিট রিকোয়েস্ট পাঠানো যায়নি!");
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    setSuccessMsg("");

    try {
      let imageUrl =
        existingImage ||
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadResult = await uploadRes.json();
        if (uploadResult.success && uploadResult.imageUrl) {
          imageUrl = uploadResult.imageUrl;
        } else {
          setSuccessMsg(
            "Image upload error: " + (uploadResult.error || "Failed")
          );
          setUploading(false);
          return;
        }
      }

      const cleanedAlternatives = (
        Array.isArray(alternativeBrands) ? alternativeBrands : []
      )
        .map((item) => ({
          name: String(item?.name || "").trim(),
          company: String(item?.company || "").trim(),
        }))
        .filter((item) => item.name || item.company);

      const payload = {
        name: selectedMedicineName,
        company: selectedCompany,
        image: imageUrl,
        unitPrice: String(unitPrice).trim(),
        stripPrice: String(stripPrice).trim(),
        boxPrice: String(boxPrice).trim(),
        uses,
        dosage,
        sideEffects,
        alternativeBrands: cleanedAlternatives,
      };

      const url = editingId ? `/api/medicines/${editingId}` : "/api/medicines";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (editingId) {
          setMedicines((prev) =>
            prev.map((item) => (item._id === editingId ? data.data : item))
          );
          setSuccessMsg(
            "Successfully update hoyeche! Frontend-e giye check korte paren."
          );
          showToast("success", `"${data.data.name}" সফলভাবে আপডেট হয়েছে!`);
        } else {
          setMedicines((prev) => [data.data, ...prev]);
          setSuccessMsg(
            "Successfully database-e save hoyeche! Frontend-e giye check korte paren."
          );
          showToast("success", `"${data.data.name}" সফলভাবে সেভ হয়েছে!`);
        }
        resetForm();
      } else {
        setSuccessMsg("Error: " + (data.error || "Failed to save"));
        showToast("error", data.error || "সেভ করতে সমস্যা হয়েছে!");
      }
    } catch (err) {
      setSuccessMsg("Failed to save data!");
      showToast("error", "ডেটা সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setUploading(false);
    }
  };

  const activePreviewImage = imagePreviewUrl || existingImage;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "flex-start",
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%)",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "clip",
        boxSizing: "border-box",
      }}
    >
      {/* Top Toast Pop-up Notification (Save & Delete Confirm) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: isMobile ? "12px" : "20px",
            left: isMobile ? "12px" : "50%",
            right: isMobile ? "12px" : "auto",
            transform: isMobile ? "none" : "translateX(-50%)",
            zIndex: 2500,
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "10px" : "12px",
            padding: isMobile ? "12px 14px" : "14px 18px",
            borderRadius: "16px",
            background:
              toast.type === "success"
                ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
                : "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
            color: "white",
            boxShadow:
              "0 20px 28px -6px rgba(15, 23, 42, 0.3), 0 8px 12px -6px rgba(15, 23, 42, 0.18)",
            border:
              toast.type === "success"
                ? "1px solid rgba(16, 185, 129, 0.5)"
                : "1px solid rgba(248, 113, 113, 0.5)",
            width: isMobile ? "auto" : "max-content",
            minWidth: isMobile ? "0" : "310px",
            maxWidth: isMobile
              ? "calc(100vw - 24px)"
              : "min(460px, calc(100vw - 32px))",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: isMobile ? "30px" : "34px",
              height: isMobile ? "30px" : "34px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                toast.type === "success"
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(248, 113, 113, 0.2)",
              color: toast.type === "success" ? "#34d399" : "#fca5a5",
              fontSize: isMobile ? "14px" : "16px",
              fontWeight: "700",
              flexShrink: 0,
            }}
          >
            {toast.type === "success" ? "✓" : "!"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: "700",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: toast.type === "success" ? "#34d399" : "#fca5a5",
                marginBottom: "2px",
              }}
            >
              {toast.type === "success" ? "Notification" : "Alert"}
            </div>
            <div
              style={{
                fontSize: isMobile ? "12.5px" : "13.5px",
                fontWeight: "500",
                lineHeight: "1.4",
                wordBreak: "break-word",
              }}
            >
              {toast.message}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Close notification"
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "15px",
              padding: "4px",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal (Separate File) */}
      <DeleteConfirmModal
        deleteTarget={deleteTarget}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isMobile={isMobile}
      />

      {/* Left Sidebar Component */}
      <LeftSidebar
        emblem={renderPharmaEmblem(36)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredCompanies={filteredCompanies}
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        setSavedMedicineQuery={setSavedMedicineQuery}
        setActiveMedicineSearch={setActiveMedicineSearch}
        setSelectedMedicineName={setSelectedMedicineName}
        editingId={editingId}
        medicines={medicines}
        isMobile={isMobile}
        isTablet={isTablet}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        handleLogout={handleLogout}
      />

      {/* Right Content Component */}
      <RightContent
        emblem={renderPharmaEmblem(isMobile ? 36 : 42)}
        isMobile={isMobile}
        isTablet={isTablet}
        totalCompaniesCount={CompanyList.length}
        totalMedicinesCount={medicines.length}
        selectedCompany={selectedCompany}
        companyMedicines={companyMedicines}
        filteredCompanyMedicines={filteredCompanyMedicines}
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
        savedMedicineQuery={savedMedicineQuery}
        setSavedMedicineQuery={setSavedMedicineQuery}
        activeMedicineSearch={activeMedicineSearch}
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