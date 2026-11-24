"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { initialMedicines } from "../../data/medicines";
import AlternativeBrandsBox from "../../components/AlternativeBrandsBox";

function primeSingleMedicineInCache(med) {
  if (!med || typeof med !== "object") return;
  const targetId = String(med?._id || med?.id || "").trim();
  if (!targetId) return;

  try {
    const existingRaw = JSON.parse(
      sessionStorage.getItem("allMedicinesCache") || "[]"
    );
    const list = Array.isArray(existingRaw) ? existingRaw : [];
    const filtered = list.filter(
      (item) => String(item?._id || item?.id || "").trim() !== targetId
    );
    sessionStorage.setItem(
      "allMedicinesCache",
      JSON.stringify([med, ...filtered])
    );
  } catch {
    // ignore storage errors
  }
}

function findLocalMedicine(id) {
  if (!id) return null;

  try {
    const cachedList = JSON.parse(
      sessionStorage.getItem("allMedicinesCache") || "[]"
    );
    if (Array.isArray(cachedList)) {
      const fromCache = cachedList.find(
        (med) =>
          String(med?._id) === String(id) || String(med?.id) === String(id)
      );
      if (fromCache) return fromCache;
    }
  } catch {
    // ignore storage errors
  }

  if (Array.isArray(initialMedicines)) {
    return (
      initialMedicines.find(
        (med) =>
          String(med?.id) === String(id) || String(med?._id) === String(id)
      ) || null
    );
  }

  return null;
}

const formatPriceLabel = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "";
  }
  const str = String(value).trim();
  return str.startsWith("৳") ? str : `৳${str}`;
};

export default function MedicineDetail({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [medicine, setMedicine] = useState(null);
  const [syncing, setSyncing] = useState(true);
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
    const instantMatch = findLocalMedicine(id);

    if (instantMatch) {
      setMedicine(instantMatch);
      primeSingleMedicineInCache(instantMatch);
      setSyncing(false);
    } else {
      setSyncing(true);
    }

    async function syncFreshDetail() {
      try {
        const res = await fetch(`/api/medicines?_t=${Date.now()}`, {
          cache: "no-store",
        });
        const text = await res.text();
        if (res.ok && text) {
          const result = JSON.parse(text);
          if (result.success && Array.isArray(result.data)) {
            try {
              sessionStorage.setItem(
                "allMedicinesCache",
                JSON.stringify(result.data)
              );
            } catch {
              // ignore quota errors
            }

            const foundDb = result.data.find(
              (med) =>
                String(med?._id) === String(id) ||
                String(med?.id) === String(id)
            );
            if (foundDb && isMounted) {
              setMedicine(foundDb);
            }
          }
        }
      } catch (err) {
        console.error("Background sync error:", err);
      } finally {
        if (isMounted) {
          setSyncing(false);
        }
      }
    }

    syncFreshDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const isMobile = viewport === "mobile";
  const isTablet = viewport === "tablet";

  if (!medicine && syncing) {
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
        <div
          style={{
            background: "white",
            padding: isMobile ? "20px" : "32px",
            borderRadius: isMobile ? "16px" : "22px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 25px -10px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              height: isMobile ? "180px" : "240px",
              borderRadius: "14px",
              background: "#f1f5f9",
              marginBottom: "18px",
            }}
          />
          <div
            style={{
              height: "24px",
              width: "60%",
              borderRadius: "8px",
              background: "#e2e8f0",
              marginBottom: "10px",
            }}
          />
          <div
            style={{
              height: "16px",
              width: "35%",
              borderRadius: "8px",
              background: "#f1f5f9",
            }}
          />
        </div>
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

  const unitLabel = formatPriceLabel(medicine.unitPrice);
  const stripLabel = formatPriceLabel(medicine.stripPrice);
  const boxLabel = formatPriceLabel(medicine.boxPrice);
  const hasAnyPrice = Boolean(unitLabel || stripLabel || boxLabel);

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
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
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

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            fontSize: "12px",
            fontWeight: "700",
            color: "#1d4ed8",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            padding: "5px 11px",
            borderRadius: "999px",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </svg>
          Sheikh Drugs Pharma
        </span>
      </div>

      <div
        className="detail-box"
        style={{
          background: "white",
          padding: isMobile ? "16px" : isTablet ? "24px" : "32px",
          borderRadius: isMobile ? "16px" : "22px",
          marginTop: isMobile ? "12px" : "18px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 12px 28px -12px rgba(15, 23, 42, 0.08)",
          boxSizing: "border-box",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {medicine.image && (
          <div
            style={{
              marginBottom: isMobile ? "16px" : "24px",
              width: "100%",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: isMobile ? "100%" : isTablet ? "420px" : "480px",
                aspectRatio: "4 / 3",
                overflow: "hidden",
                borderRadius: isMobile ? "12px" : "16px",
                border: "1px solid #e2e8f0",
                background: "#f1f5f9",
                margin: "0 auto",
              }}
            >
              <img
                src={medicine.image}
                alt={medicine.name}
                decoding="async"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {/* Top-Left: Unit Price */}
              {unitLabel && (
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    background: "rgba(15, 23, 42, 0.85)",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    backdropFilter: "blur(4px)",
                    lineHeight: 1.2,
                  }}
                >
                  Unit: {unitLabel}
                </span>
              )}

              {/* Top-Right: Strip Price */}
              {stripLabel && (
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(29, 78, 216, 0.9)",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    backdropFilter: "blur(4px)",
                    lineHeight: 1.2,
                  }}
                >
                  Strip: {stripLabel}
                </span>
              )}

              {/* Bottom-Right: Full Box Price */}
              {boxLabel && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    background: "rgba(5, 150, 105, 0.92)",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    backdropFilter: "blur(4px)",
                    lineHeight: 1.2,
                  }}
                >
                  Box: {boxLabel}
                </span>
              )}
            </div>
          </div>
        )}

        <h1
          style={{
            marginTop: 0,
            color: "#0f172a",
            fontSize: isMobile ? "21px" : isTablet ? "25px" : "28px",
            fontWeight: "800",
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
            fontWeight: "700",
            fontSize: isMobile ? "14px" : "16px",
            lineHeight: "1.45",
            marginBottom: hasAnyPrice ? "16px" : isMobile ? "18px" : "24px",
            wordBreak: "break-word",
          }}
        >
          🏢 {medicine.company}
        </p>

        {hasAnyPrice && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(3, minmax(0, 1fr))",
              gap: "10px",
              marginBottom: isMobile ? "16px" : "20px",
            }}
          >
            {unitLabel && (
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: "11.5px",
                    fontWeight: "700",
                    color: "#475569",
                  }}
                >
                  Unit Price
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "800",
                    color: "#0f172a",
                    marginTop: "2px",
                  }}
                >
                  {unitLabel}
                </div>
              </div>
            )}

            {stripLabel && (
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "12px",
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: "11.5px",
                    fontWeight: "700",
                    color: "#1d4ed8",
                  }}
                >
                  Strip Price
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "800",
                    color: "#1e3a8a",
                    marginTop: "2px",
                  }}
                >
                  {stripLabel}
                </div>
              </div>
            )}

            {boxLabel && (
              <div
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "12px",
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: "11.5px",
                    fontWeight: "700",
                    color: "#047857",
                  }}
                >
                  Full Box Price
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "800",
                    color: "#065f46",
                    marginTop: "2px",
                  }}
                >
                  {boxLabel}
                </div>
              </div>
            )}
          </div>
        )}

        <div
          className="info-card uses"
          style={{
            background: "#f8fafc",
            padding: isMobile ? "14px" : "16px 18px",
            borderRadius: "14px",
            marginBottom: "14px",
            border: "1px solid #e2e8f0",
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
            borderRadius: "14px",
            marginBottom: "14px",
            border: "1px solid #e2e8f0",
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
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
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

        {/* Alternative Brands Section at the Bottom */}
        <AlternativeBrandsBox medicine={medicine} />
      </div>
    </main>
  );
}