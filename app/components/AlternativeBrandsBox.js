"use client";
import { getAlternativeBrands } from "../data/medicines";

export default function AlternativeBrandsBox({ medicine }) {
  const alternatives = getAlternativeBrands(medicine);

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
        {alternatives.map((alt, idx) => (
          <div
            key={`${alt.name}-${alt.company}-${idx}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "10px",
              background: "#ffffff",
              border: "1px solid #ccfbf1",
              boxShadow: "0 2px 6px rgba(15, 118, 110, 0.06)",
            }}
          >
            {alt.name && (
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#0f172a",
                }}
              >
                {alt.name}
              </span>
            )}
            {alt.company && (
              <span
                style={{
                  fontSize: "11.5px",
                  fontWeight: "700",
                  color: "#0f766e",
                  background: "#ccfbf1",
                  padding: "2px 8px",
                  borderRadius: "999px",
                }}
              >
                {alt.company}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}