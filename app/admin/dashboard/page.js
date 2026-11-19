"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CompanyList } from "../../data/medicines";

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

  const sidebarContent = (
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
          {renderPharmaEmblem(36)}
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

      {/* Search Input in Sidebar */}
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
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%)",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Premium Toast Pop-up Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: isMobile ? "14px" : "24px",
            right: isMobile ? "14px" : "24px",
            left: isMobile ? "14px" : "auto",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 18px",
            borderRadius: "16px",
            background:
              toast.type === "success"
                ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
                : "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
            color: "white",
            boxShadow:
              "0 20px 25px -5px rgba(15, 23, 42, 0.25), 0 8px 10px -6px rgba(15, 23, 42, 0.15)",
            border:
              toast.type === "success"
                ? "1px solid rgba(16, 185, 129, 0.45)"
                : "1px solid rgba(248, 113, 113, 0.45)",
            minWidth: isMobile ? "auto" : "290px",
            maxWidth: isMobile ? "100%" : "420px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                toast.type === "success"
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(248, 113, 113, 0.2)",
              color: toast.type === "success" ? "#34d399" : "#fca5a5",
              fontSize: "16px",
              fontWeight: "700",
              flexShrink: 0,
            }}
          >
            {toast.type === "success" ? "✓" : "!"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: toast.type === "success" ? "#34d399" : "#fca5a5",
                marginBottom: "2px",
              }}
            >
              {toast.type === "success" ? "Notification" : "Alert"}
            </div>
            <div
              style={{
                fontSize: "13.5px",
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

      {/* Premium Delete Confirmation Pop-up Modal */}
      {deleteTarget && (
        <div
          onClick={() => !deleting && setDeleteTarget(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1900,
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              boxSizing: "border-box",
              background: "white",
              borderRadius: "24px",
              padding: isMobile ? "22px" : "28px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.35)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                margin: "0 auto 14px auto",
                borderRadius: "18px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              🗑️
            </div>

            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: isMobile ? "18px" : "20px",
                fontWeight: "700",
                color: "#0f172a",
              }}
            >
              ওষুধটি ডিলিট করবেন?
            </h3>

            <p
              style={{
                margin: "0 0 22px 0",
                fontSize: "14px",
                color: "#475569",
                lineHeight: "1.6",
                wordBreak: "break-word",
              }}
            >
              আপনি{" "}
              <strong style={{ color: "#dc2626" }}>
                &ldquo;{deleteTarget.name}&rdquo;
              </strong>{" "}
              ডিলিট করতে যাচ্ছেন। এটি ডাটাবেস থেকে স্থায়ীভাবে মুছে যাবে।
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column-reverse" : "row",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  color: "#334155",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                বাতিল করুন
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  background: deleting
                    ? "#fca5a5"
                    : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: deleting ? "not-allowed" : "pointer",
                  boxShadow: "0 8px 16px -4px rgba(220, 38, 38, 0.4)",
                }}
              >
                {deleting ? "Deleting..." : "হ্যাঁ, ডিলিট করুন"}
              </button>
            </div>
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
            {renderPharmaEmblem(28)}
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
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      {!isMobile && (
        <div
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
          {sidebarContent}
        </div>
      )}

      {/* Right Content Area */}
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
            {renderPharmaEmblem(isMobile ? 36 : 42)}
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
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(3, minmax(0, 1fr))",
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
            <div
              style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}
            >
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
              {CompanyList.length}
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
            <div
              style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}
            >
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
              {medicines.length}
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
            <div
              style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}
            >
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
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(3, minmax(0, 1fr))",
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
              marginBottom: "16px",
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
              Saved Medicines in {selectedCompany} ({companyMedicines.length})
            </h3>
          </div>

          {loadingList ? (
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
              Loading...
            </p>
          ) : companyMedicines.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
              Ei company-r kono medicine database-e nei.
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {companyMedicines.map((med) => (
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
    </div>
  );
}