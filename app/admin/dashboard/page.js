"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CompanyList } from "../../data/medicines";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(CompanyList[0]);
  const [selectedMedicineName, setSelectedMedicineName] = useState("");

  // Form fields
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState("");
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
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Premium Delete Pop-up & Toast states
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success" | "error", message: string }

  const router = useRouter();

  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth < 860;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileSidebarOpen(false);
      }
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

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

  const filteredCompanies = CompanyList.filter((comp) =>
    comp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const companyMedicines = medicines.filter(
    (med) => med.company === selectedCompany
  );

  const resetForm = () => {
    setEditingId(null);
    setSelectedMedicineName("");
    setImageFile(null);
    setExistingImage("");
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
    setSelectedCompany(med.company || CompanyList[0]);
    setSelectedMedicineName(med.name || "");
    setExistingImage(med.image || "");
    setImageFile(null);
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
          setSuccessMsg("Image upload error: " + (uploadResult.error || "Failed"));
          setUploading(false);
          return;
        }
      }

      const payload = {
        name: selectedMedicineName,
        company: selectedCompany,
        image: imageUrl,
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
          setSuccessMsg("Successfully update hoyeche! Frontend-e giye check korte paren.");
          showToast("success", `"${data.data.name}" সফলভাবে আপডেট হয়েছে!`);
        } else {
          setMedicines((prev) => [data.data, ...prev]);
          setSuccessMsg("Successfully database-e save hoyeche! Frontend-e giye check korte paren.");
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

  const sidebarContent = (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
          gap: "8px",
        }}
      >
        <h2 style={{ margin: 0, color: "#2563eb", fontSize: "18px" }}>
          🛠️ Admin Panel
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: "#fee2e2",
              color: "#ef4444",
              border: "none",
              padding: "6px 10px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
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
                border: "none",
                padding: "6px 10px",
                borderRadius: "8px",
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
      <div style={{ marginBottom: "14px" }}>
        <input
          type="text"
          placeholder="Search company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            outline: "none",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Company List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          overflowY: "auto",
          flex: 1,
          paddingRight: "2px",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            fontWeight: "700",
            color: "#64748b",
            margin: "4px 0",
          }}
        >
          COMPANIES ({filteredCompanies.length})
        </p>
        {filteredCompanies.map((comp, index) => (
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
              textAlign: "left",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "none",
              background: selectedCompany === comp ? "#eff6ff" : "transparent",
              color: selectedCompany === comp ? "#2563eb" : "#334155",
              fontWeight: selectedCompany === comp ? "600" : "500",
              cursor: "pointer",
              fontSize: "13px",
              transition: "all 0.2s",
              lineHeight: "1.4",
            }}
          >
            🏢 {comp}
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        minHeight: "100vh",
        background: "#f8fafc",
        width: "100%",
        overflowX: "hidden",
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
              boxShadow:
                "0 25px 50px -12px rgba(15, 23, 42, 0.35)",
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
            background: "white",
            borderBottom: "1px solid #e2e8f0",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            style={{
              background: "#eff6ff",
              color: "#2563eb",
              border: "1px solid #bfdbfe",
              padding: "8px 12px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              flexShrink: 0,
            }}
          >
            ☰ Companies
          </button>

          <div
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#1e293b",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              textAlign: "center",
            }}
          >
            {selectedCompany}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: "#fee2e2",
              color: "#ef4444",
              border: "none",
              padding: "8px 10px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
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
              width: "84%",
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
            width: "300px",
            minWidth: "280px",
            background: "white",
            borderRight: "1px solid #e2e8f0",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            position: "sticky",
            top: 0,
            boxSizing: "border-box",
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
          padding: isMobile ? "16px" : "32px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "white",
            padding: isMobile ? "18px" : "32px",
            borderRadius: isMobile ? "16px" : "20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
            marginBottom: isMobile ? "18px" : "28px",
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
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#1e293b",
                fontSize: isMobile ? "18px" : "22px",
                lineHeight: "1.35",
              }}
            >
              {editingId ? "Editing Medicine for: " : "Adding for: "}
              <span style={{ color: "#2563eb" }}>{selectedCompany}</span>
            </h2>

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
                padding: "12px 14px",
                borderRadius: "10px",
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
                  fontWeight: "600",
                  color: "#475569",
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
                  outline: "none",
                  fontSize: "15px",
                }}
                required
              />
            </div>

            {/* Direct Image File Upload */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#475569",
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
              {editingId && existingImage && !imageFile && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "6px",
                    wordBreak: "break-all",
                  }}
                >
                  Current image kept unless a new image is selected ({existingImage}).
                </p>
              )}
            </div>

            {/* Uses */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#475569",
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
                  outline: "none",
                  fontSize: "15px",
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
                  fontWeight: "600",
                  color: "#475569",
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
                  outline: "none",
                  fontSize: "15px",
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
                  fontWeight: "600",
                  color: "#475569",
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
                  outline: "none",
                  fontSize: "15px",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              style={{
                background: uploading ? "#93c5fd" : "#2563eb",
                color: "white",
                padding: "13px 22px",
                border: "none",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "15px",
                cursor: uploading ? "not-allowed" : "pointer",
                alignSelf: isMobile ? "stretch" : "flex-start",
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
            padding: isMobile ? "18px" : "28px",
            borderRadius: isMobile ? "16px" : "20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
            boxSizing: "border-box",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "16px",
              color: "#1e293b",
              fontSize: isMobile ? "16px" : "18px",
              lineHeight: "1.4",
            }}
          >
            Saved Medicines in {selectedCompany} ({companyMedicines.length})
          </h3>

          {loadingList ? (
            <p style={{ color: "#64748b", fontSize: "14px" }}>Loading...</p>
          ) : companyMedicines.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              Ei company-r kono medicine database-e nei.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {companyMedicines.map((med) => (
                <div
                  key={med._id}
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "stretch" : "center",
                    padding: "14px 16px",
                    borderRadius: "12px",
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
                        style={{
                          width: "48px",
                          height: "48px",
                          objectFit: "cover",
                          borderRadius: "8px",
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
                          display: "block",
                          wordBreak: "break-word",
                        }}
                      >
                        {med.name}
                      </strong>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: "12px",
                          wordBreak: "break-word",
                        }}
                      >
                        {med.company}
                      </div>
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
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
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
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
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