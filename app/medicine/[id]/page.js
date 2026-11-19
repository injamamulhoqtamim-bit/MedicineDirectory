"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { initialMedicines } from "../../data/medicines";

export default function MedicineDetail({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewport, setViewport] = useState("desktop"); // "mobile" | "tablet" | "desktop"

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setViewport("mobile");
      } else if (width < 1024) {
        setViewport("tablet");
      } else {
        setViewport("desktop");
      }
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchDetail() {
      setLoading(true);
      try {
        const res = await fetch("/api/medicines", { cache: "no-store" });
        const text = await res.text();
        if (res.ok && text) {
          const result = JSON.parse(text);
          if (result.success && Array.isArray(result.data)) {
            const foundDb = result.data.find(
              (med) => String(med._id) === String(id)
            );
            if (foundDb) {
              if (isMounted) {
                setMedicine(foundDb);
                setLoading(false);
              }
              return;
            }
          }
        }

        const foundStatic = initialMedicines.find(
          (med) => String(med.id) === String(id)
        );
        if (isMounted) {
          setMedicine(foundStatic || null);
        }
      } catch (err) {
        console.error("Error fetching detail:", err);
        const foundStatic = initialMedicines.find(
          (med) => String(med.id) === String(id)
        );
        if (isMounted) {
          setMedicine(foundStatic || null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const isMobile = viewport === "mobile";
  const isTablet = viewport === "tablet";

  if (loading) {
    return (
      <main
        className="container"
        style={{
          width: "100%",
          maxWidth: "880px",
          margin: "0 auto",
          textAlign: "center",
          padding: isMobile ? "40px 16px" : "60px 24px",
          boxSizing: "border-box",
        }}
      >
        <p style={{ margin: 0, fontSize: "15px", color: "#475569", fontWeight: "500" }}>
          লোড হচ্ছে...
        </p>
      </main>
    );
  }

  if (!medicine) {
    return (
      <main
        className="container"
        style={{
          width: "100%",
          maxWidth: "880px",
          margin: "0 auto",
          textAlign: "center",
          padding: isMobile ? "40px 16px" : "60px 24px",
          boxSizing: "border-box",
        }}
      >
        <Link
          href="/"
          className="back-link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "14px",
            fontWeight: "600",
          }}
        >
          ← হোমপেজে ফিরে যান
        </Link>
        <h2
          style={{
            margin: "8px 0 0 0",
            fontSize: isMobile ? "20px" : "24px",
            color: "#1e293b",
          }}
        >
          ওষুধটি খুঁজে পাওয়া যায়নি!
        </h2>
      </main>
    );
  }

  return (
    <main
      className="container"
      style={{
        width: "100%",
        maxWidth: "880px",
        margin: "0 auto",
        padding: isMobile ? "14px" : isTablet ? "22px 20px" : "30px 24px",
        boxSizing: "border-box",
      }}
    >
      <Link
        href="/"
        className="back-link"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: isMobile ? "14px" : "15px",
          fontWeight: "600",
        }}
      >
        ← হোমপেজে ফিরে যান
      </Link>

      <div
        className="detail-box"
        style={{
          background: "white",
          padding: isMobile ? "16px" : isTablet ? "24px" : "32px",
          borderRadius: isMobile ? "16px" : "20px",
          marginTop: isMobile ? "12px" : "18px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
          boxSizing: "border-box",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {medicine.image && (
          <div
            style={{
              marginBottom: isMobile ? "16px" : "24px",
              textAlign: "center",
              width: "100%",
            }}
          >
            <img
              src={medicine.image}
              alt={medicine.name}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              style={{
                width: "100%",
                maxWidth: isMobile ? "100%" : isTablet ? "420px" : "480px",
                height: isMobile ? "185px" : isTablet ? "230px" : "265px",
                objectFit: "cover",
                borderRadius: isMobile ? "12px" : "16px",
                border: "1px solid #e2e8f0",
                display: "block",
                margin: "0 auto",
              }}
            />
          </div>
        )}

        <h1
          style={{
            marginTop: 0,
            color: "#1e293b",
            fontSize: isMobile ? "21px" : isTablet ? "25px" : "28px",
            lineHeight: "1.3",
            marginBottom: "6px",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          }}
        >
          {medicine.name}
        </h1>

        <p
          style={{
            color: "#2563eb",
            fontWeight: "600",
            fontSize: isMobile ? "14px" : "16px",
            lineHeight: "1.45",
            marginBottom: isMobile ? "18px" : "24px",
            wordBreak: "break-word",
          }}
        >
          🏢 {medicine.company}
        </p>

        <div
          className="info-card uses"
          style={{
            background: "#f8fafc",
            padding: isMobile ? "14px" : "16px 18px",
            borderRadius: "12px",
            marginBottom: "14px",
            border: "1px solid #f1f5f9",
          }}
        >
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: isMobile ? "15px" : "16px",
              fontWeight: "700",
              color: "#0f172a",
            }}
          >
            💊 কিসের জন্য খাওয়া হয় (Uses):
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: isMobile ? "14px" : "15px",
              lineHeight: "1.65",
              color: "#334155",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {medicine.uses || "তথ্য দেওয়া হয়নি"}
          </p>
        </div>

        <div
          className="info-card dosage"
          style={{
            background: "#f8fafc",
            padding: isMobile ? "14px" : "16px 18px",
            borderRadius: "12px",
            marginBottom: "14px",
            border: "1px solid #f1f5f9",
          }}
        >
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: isMobile ? "15px" : "16px",
              fontWeight: "700",
              color: "#0f172a",
            }}
          >
            🕒 খাওয়ার নিয়ম (Dosage):
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: isMobile ? "14px" : "15px",
              lineHeight: "1.65",
              color: "#334155",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {medicine.dosage || "তথ্য দেওয়া হয়নি"}
          </p>
        </div>

        <div
          className="info-card side-effects"
          style={{
            background: "#f8fafc",
            padding: isMobile ? "14px" : "16px 18px",
            borderRadius: "12px",
            border: "1px solid #f1f5f9",
          }}
        >
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: isMobile ? "15px" : "16px",
              fontWeight: "700",
              color: "#0f172a",
            }}
          >
            ⚠️ পার্শ্বপ্রতিক্রিয়া (Side Effects):
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: isMobile ? "14px" : "15px",
              lineHeight: "1.65",
              color: "#334155",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {medicine.sideEffects || "তথ্য দেওয়া হয়নি"}
          </p>
        </div>
      </div>
    </main>
  );
}