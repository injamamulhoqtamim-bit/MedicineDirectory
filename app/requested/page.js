"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

const getMedicineKey = (med, company, index) => {
  if (med?._id) return String(med._id);
  if (med?.id !== undefined && med?.id !== null && med?.id !== "") {
    return String(med.id);
  }
  return `${company}-${med?.name || "medicine"}-${index}`;
};

export default function RequestedMedicines() {
  const [missingList, setMissingList] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  useEffect(() => {
    const syncList = () => {
      try {
        const stored =
          JSON.parse(localStorage.getItem("missingMedicines")) || [];
        setMissingList(Array.isArray(stored) ? stored : []);
      } catch {
        setMissingList([]);
      }
    };

    syncList();
    window.addEventListener("storageUpdate", syncList);
    window.addEventListener("focus", syncList);

    return () => {
      window.removeEventListener("storageUpdate", syncList);
      window.removeEventListener("focus", syncList);
    };
  }, []);

  const handleDelete = (targetKey) => {
    const updated = missingList.filter((item, idx) => {
      const compName = String(item?.company || "Unknown Company").trim();
      const itemKey = getMedicineKey(item, compName, idx);
      return itemKey !== targetKey;
    });

    setMissingList(updated);
    localStorage.setItem("missingMedicines", JSON.stringify(updated));
    window.dispatchEvent(new Event("storageUpdate"));
  };

  const groupedByCompany = useMemo(() => {
    return missingList.reduce((acc, item, index) => {
      const companyName =
        String(item?.company || "").trim() || "Unknown Company";
      if (!acc[companyName]) {
        acc[companyName] = [];
      }
      acc[companyName].push({
        ...item,
        _uniqueKey: getMedicineKey(item, companyName, index),
      });
      return acc;
    }, {});
  }, [missingList]);

  const companyEntries = Object.entries(groupedByCompany);

  return (
    <main
      className="container"
      style={{
        width: "100%",
        maxWidth: "960px",
        margin: "0 auto",
        padding: isMobile ? "12px 14px 28px" : "18px 24px 40px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <Link
          href="/"
          className="back-link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13.5px",
            fontWeight: "600",
            color: "#334155",
            textDecoration: "none",
          }}
        >
          ← হোমপেজে ফিরে যান
        </Link>

        {missingList.length > 0 && (
          <span
            style={{
              background: "#eff6ff",
              color: "#1d4ed8",
              border: "1px solid #bfdbfe",
              padding: "5px 12px",
              borderRadius: "999px",
              fontSize: "12.5px",
              fontWeight: "700",
            }}
          >
            মোট সিলেক্ট করা ওষুধ: {missingList.length}
          </span>
        )}
      </div>

      <div
        className="detail-box"
        style={{
          background: "#ffffff",
          borderRadius: isMobile ? "18px" : "22px",
          padding: isMobile ? "18px 16px" : "28px 32px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 12px 28px -10px rgba(15, 23, 42, 0.07)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: "10px",
            marginBottom: "22px",
            paddingBottom: "14px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: isMobile ? "18px" : "23px",
              fontWeight: "800",
              lineHeight: "1.35",
            }}
          >
            📦 আপনার সিলেক্ট করা মিসিং ওষুধের তালিকা (কোম্পানি অনুযায়ী)
          </h1>

          {companyEntries.length > 0 && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#64748b",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "4px 10px",
                borderRadius: "999px",
                whiteSpace: "nowrap",
              }}
            >
              {companyEntries.length}টি কোম্পানি
            </span>
          )}
        </div>

        {companyEntries.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: isMobile ? "32px 14px" : "48px 20px",
              color: "#64748b",
              background: "#f8fafc",
              borderRadius: "16px",
              border: "1px dashed #cbd5e1",
            }}
          >
            <p
              style={{
                margin: "0 0 14px 0",
                fontSize: "15px",
                fontWeight: "600",
                color: "#475569",
              }}
            >
              কোনো ওষুধ সিলেক্ট করা হয়নি।
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "#ffffff",
                textDecoration: "none",
                padding: "9px 16px",
                borderRadius: "10px",
                fontSize: "13.5px",
                fontWeight: "600",
                boxShadow: "0 6px 14px -4px rgba(37, 99, 235, 0.4)",
              }}
            >
              ওষুধ খুঁজুন
            </Link>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            {companyEntries.map(([company, medicines]) => (
              <div
                key={company}
                style={{
                  background: "#f8fafc",
                  padding: isMobile ? "14px" : "20px",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <h3
                    style={{
                      color: "#1d4ed8",
                      margin: 0,
                      fontSize: isMobile ? "15.5px" : "18px",
                      fontWeight: "700",
                      lineHeight: "1.35",
                      wordBreak: "break-word",
                    }}
                  >
                    🏢 {company}
                  </h3>
                  <span
                    style={{
                      background: "#dbeafe",
                      color: "#1e40af",
                      fontSize: "11.5px",
                      fontWeight: "700",
                      padding: "3px 9px",
                      borderRadius: "999px",
                      flexShrink: 0,
                    }}
                  >
                    {medicines.length}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {medicines.map((med, index) => (
                    <div
                      key={med._uniqueKey || `${company}-${index}`}
                      style={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        justifyContent: "space-between",
                        alignItems: isMobile ? "stretch" : "center",
                        background: "#ffffff",
                        padding: isMobile ? "11px 13px" : "12px 16px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        gap: "10px",
                        boxSizing: "border-box",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: "600",
                            color: "#0f172a",
                            fontSize: isMobile ? "14.5px" : "15px",
                            wordBreak: "break-word",
                          }}
                        >
                          {med.name}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(med._uniqueKey)}
                        style={{
                          background: "#fee2e2",
                          color: "#dc2626",
                          border: "1px solid #fecaca",
                          padding: isMobile ? "7px 12px" : "6px 13px",
                          borderRadius: "9px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "600",
                          alignSelf: isMobile ? "flex-end" : "center",
                          flexShrink: 0,
                        }}
                      >
                        ডিলিট
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}