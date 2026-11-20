"use client";

export function DeleteMedicineButton({
  id,
  name,
  onOpenDeleteModal,
  isMobile,
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenDeleteModal(id, name)}
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
        whiteSpace: "nowrap",
      }}
    >
      Delete
    </button>
  );
}

export function DeleteConfirmModal({
  deleteTarget,
  deleting,
  onCancel,
  onConfirm,
  isMobile,
}) {
  if (!deleteTarget) return null;

  return (
    <div
      onClick={() => !deleting && onCancel()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1900,
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "14px" : "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "420px",
          boxSizing: "border-box",
          background: "white",
          borderRadius: isMobile ? "20px" : "24px",
          padding: isMobile ? "20px" : "28px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.35)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: isMobile ? "48px" : "56px",
            height: isMobile ? "48px" : "56px",
            margin: "0 auto 14px auto",
            borderRadius: "18px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isMobile ? "21px" : "24px",
          }}
        >
          🗑️
        </div>

        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: isMobile ? "17.5px" : "20px",
            fontWeight: "700",
            color: "#0f172a",
          }}
        >
          ওষুধটি ডিলিট করবেন?
        </h3>

        <p
          style={{
            margin: "0 0 22px 0",
            fontSize: isMobile ? "13px" : "14px",
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
            onClick={onCancel}
            style={{
              flex: 1,
              padding: isMobile ? "11px 14px" : "12px 16px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              color: "#334155",
              fontWeight: "600",
              fontSize: "13.5px",
              cursor: deleting ? "not-allowed" : "pointer",
            }}
          >
            বাতিল করুন
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: isMobile ? "11px 14px" : "12px 16px",
              borderRadius: "12px",
              border: "none",
              background: deleting
                ? "#fca5a5"
                : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "white",
              fontWeight: "600",
              fontSize: "13.5px",
              cursor: deleting ? "not-allowed" : "pointer",
              boxShadow: "0 8px 16px -4px rgba(220, 38, 38, 0.4)",
            }}
          >
            {deleting ? "Deleting..." : "হ্যাঁ, ডিলিট করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}