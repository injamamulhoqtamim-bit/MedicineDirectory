"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { initialMedicines, getAlternativeBrands } from "../data/medicines";

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function mergeMedicineSources(dbData) {
  const cachedRaw = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("allMedicinesCache") || "[]");
    } catch {
      return [];
    }
  })();

  const combined = [
    ...(Array.isArray(dbData) ? dbData : []),
    ...(Array.isArray(cachedRaw) ? cachedRaw : []),
    ...(Array.isArray(initialMedicines) ? initialMedicines : []),
  ];

  const seen = new Set();
  return combined.filter((item) => {
    if (!item || typeof item !== "object") return false;
    const idPart = String(item._id || item.id || "").trim();
    const key =
      idPart ||
      `${normalizeText(item.name)}__${normalizeText(item.company)}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function findMatchingMedicine(allMeds, alt) {
  const targetName = normalizeText(alt?.name);
  const targetCompany = normalizeText(alt?.company);
  if (!targetName) return null;

  // ১. নাম এবং কোম্পানি দুটোই মিললে সবচেয়ে সঠিক ম্যাচ
  if (targetCompany) {
    const exactBoth = allMeds.find(
      (m) =>
        normalizeText(m?.name) === targetName &&
        normalizeText(m?.company) === targetCompany
    );
    if (exactBoth) return exactBoth;
  }

  // ২. পুরো নাম মিলে গেলে
  const exactName = allMeds.find(
    (m) => normalizeText(m?.name) === targetName
  );
  if (exactName) return exactName;

  // ৩. আংশিক নাম ম্যাচ (যেমন "Napa" বা "Napa 500mg")
  const partialName = allMeds.find((m) => {
    const medName = normalizeText(m?.name);
    return medName.includes(targetName) || targetName.includes(medName);
  });
  return partialName || null;
}

export default function AlternativeBrandsBox({ medicine }) {
  const router = useRouter();
  const alternatives = getAlternativeBrands(medicine);

  const [medicinesPool, setMedicinesPool] = useState(() =>
    mergeMedicineSources([])
  );
  const [statusNotice, setStatusNotice] = useState("");
  const [checkingName, setCheckingName] = useState("");

  useEffect(() => {
    let active = true;
    setMedicinesPool(mergeMedicineSources([]));

    fetch("/api/medicines", { cache: "no-store" })
      .then((res) => res.text())
      .then((text) => {
        if (!active || !text) return;
        const parsed = JSON.parse(text);
        if (parsed?.success && Array.isArray(parsed.data)) {
          const merged = mergeMedicineSources(parsed.data);
          setMedicinesPool(merged);
          try {
            sessionStorage.setItem("allMedicinesCache", JSON.stringify(merged));
          } catch {
            // ignore storage errors
          }
        }
      })
      .catch(() => {
        // fallback to already merged pool
      });

    return () => {
      active = false;
    };
  }, []);

  const showNotAddedMessage = useCallback((medName) => {
    setStatusNotice(`"${medName}" এখনো যুক্ত করা হয়নি।`);
    setTimeout(() => {
      setStatusNotice((prev) =>
        prev === `"${medName}" এখনো যুক্ত করা হয়নি।` ? "" : prev
      );
    }, 2600);
  }, []);

  const handleAlternativeClick = async (e, alt) => {
    e.preventDefault();
    e.stopPropagation();

    const labelName = String(alt?.name || "").trim() || "এই ঔষধটি";
    setCheckingName(labelName);

    let currentPool = medicinesPool;
    const matchedLocal = findMatchingMedicine(currentPool, alt);

    if (matchedLocal && (matchedLocal._id || matchedLocal.id)) {
      const targetId = matchedLocal._id || matchedLocal.id;
      router.push(`/medicine/${targetId}`);
      setCheckingName("");
      return;
    }

    // লোকাল পুলে না পেলে সর্বশেষ DB ডেটা একবার চেক করবে
    try {
      const res = await fetch("/api/medicines", { cache: "no-store" });
      const text = await res.text();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed?.success && Array.isArray(parsed.data)) {
          currentPool = mergeMedicineSources(parsed.data);
          setMedicinesPool(currentPool);
          const matchedFresh = findMatchingMedicine(currentPool, alt);
          if (matchedFresh && (matchedFresh._id || matchedFresh.id)) {
            router.push(`/medicine/${matchedFresh._id || matchedFresh.id}`);
            setCheckingName("");
            return;
          }
        }
      }
    } catch {
      // ignore network error
    }

    setCheckingName("");
    showNotAddedMessage(labelName);
  };

  if (alternatives.length === 0) return null;

  return (
    <div
      style={{
        marginTop: "12px",
        padding: "12px 14px",
        borderRadius: "14px",
        background: "#f0fdfa",
        border: "1px solid #99f6e4",
      }}
    >
      <div
        style={{
          fontSize: "12.5px",
          fontWeight: "800",
          color: "#0f766e",
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span>🔄 Alternative Brands ({alternatives.length})</span>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {alternatives.map((alt, idx) => {
          const isMatched = Boolean(findMatchingMedicine(medicinesPool, alt));
          const isChecking = checkingName === String(alt?.name || "").trim();

          return (
            <button
              type="button"
              key={`${alt.name}-${alt.company}-${idx}`}
              onClick={(e) => handleAlternativeClick(e, alt)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "10px",
                background: isMatched ? "#ffffff" : "#f8fafc",
                border: isMatched
                  ? "1px solid #5eead4"
                  : "1px dashed #cbd5e1",
                boxShadow: isMatched
                  ? "0 2px 6px rgba(15, 118, 110, 0.08)"
                  : "none",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              {alt.name && (
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: isMatched ? "#0f172a" : "#334155",
                    textDecoration: isMatched ? "underline" : "none",
                    textUnderlineOffset: "3px",
                  }}
                >
                  {isChecking ? "খুঁজছে..." : alt.name}
                </span>
              )}
              {alt.company && (
                <span
                  style={{
                    fontSize: "11.5px",
                    fontWeight: "700",
                    color: isMatched ? "#0f766e" : "#475569",
                    background: isMatched ? "#ccfbf1" : "#e2e8f0",
                    padding: "2px 8px",
                    borderRadius: "999px",
                  }}
                >
                  {alt.company}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {statusNotice && (
        <div
          style={{
            marginTop: "10px",
            padding: "8px 12px",
            borderRadius: "9px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          {statusNotice}
        </div>
      )}
    </div>
  );
}