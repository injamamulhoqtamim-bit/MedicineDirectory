"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
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

  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  const isMobile = viewport === "mobile";
  const isTablet = viewport === "tablet";

  return (
    <footer
      style={{
        width: "100%",
        maxWidth: "1360px",
        margin: isMobile ? "22px auto 14px auto" : "34px auto 20px auto",
        padding: isMobile ? "18px 14px" : isTablet ? "22px 20px" : "28px 24px",
        background:
          "linear-gradient(135deg, #090e1a 0%, #0f172a 48%, #1e3a8a 100%)",
        color: "#ffffff",
        borderRadius: isMobile ? "16px" : "22px",
        border: "1px solid rgba(147, 197, 253, 0.28)",
        boxShadow:
          "0 20px 38px -12px rgba(15, 23, 42, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        boxSizing: "border-box",
        overflowX: "clip",
      }}
    >
      {/* Top Section: Brand + Quick Navigation + Direct Call */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          gap: isMobile ? "14px" : "18px",
          paddingBottom: isMobile ? "14px" : "20px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.22)",
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 260px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "999px",
              background: "rgba(56, 189, 248, 0.14)",
              border: "1px solid rgba(125, 211, 252, 0.28)",
              fontSize: isMobile ? "10px" : "11px",
              fontWeight: "700",
              letterSpacing: "0.04em",
              color: "#7dd3fc",
              marginBottom: "8px",
            }}
          >
            <span>PHARMACY DIRECTORY</span>
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: isMobile ? "18px" : isTablet ? "20px" : "22px",
              fontWeight: "800",
              letterSpacing: "-0.015em",
              color: "#ffffff",
              lineHeight: 1.25,
              wordBreak: "break-word",
            }}
          >
            Sheikh Drugs House
          </h2>
          <p
            style={{
              margin: "5px 0 0 0",
              fontSize: isMobile ? "12px" : "13px",
              lineHeight: 1.5,
              color: "#cbd5e1",
              wordBreak: "break-word",
            }}
          >
            ঔষধের ব্যবহার, খাওয়ার নিয়ম ও পার্শ্বপ্রতিক্রিয়ার তথ্য নির্দেশিকা
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            flexWrap: "wrap",
            alignItems: isMobile ? "stretch" : "center",
            gap: isMobile ? "8px" : "10px",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#f8fafc",
              textDecoration: "none",
              padding: isMobile ? "9px 14px" : "9px 15px",
              borderRadius: "12px",
              fontSize: isMobile ? "12.5px" : "13px",
              fontWeight: "700",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              textAlign: "center",
            }}
          >
            হোম
          </Link>

          <a
            href="tel:01940195143"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "#0f172a",
              textDecoration: "none",
              padding: isMobile ? "10px 14px" : "9px 16px",
              borderRadius: "12px",
              fontSize: isMobile ? "13px" : "13.5px",
              fontWeight: "800",
              background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
              border: "1px solid rgba(255, 255, 255, 0.65)",
              boxShadow: "0 8px 18px -6px rgba(125, 211, 252, 0.55)",
            }}
          >
            <span>📞</span>
            <span>01940195143</span>
          </a>
        </div>
      </div>

      {/* Middle Section: Pharmacy Policy & Contact Info */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : isTablet
            ? "repeat(2, minmax(0, 1fr))"
            : "repeat(3, minmax(0, 1fr))",
          gap: isMobile ? "10px" : "14px",
          padding: isMobile ? "14px 0" : "18px 0",
          borderBottom: "1px solid rgba(148, 163, 184, 0.22)",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: isMobile ? "12px" : "15px",
            padding: isMobile ? "12px 13px" : "14px 16px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: isMobile ? "11.5px" : "12px",
              fontWeight: "700",
              color: "#7dd3fc",
              marginBottom: "6px",
            }}
          >
            ঔষধ সংগ্রহ ও ডেলিভারি তথ্য
          </div>
          <p
            style={{
              margin: 0,
              fontSize: isMobile ? "12.5px" : "13px",
              lineHeight: 1.6,
              color: "#e2e8f0",
              wordBreak: "break-word",
            }}
          >
            ঔষধ নিতে হলে ফার্মেসিতে আসতে হবে, কোনো ডেলিভারি দেওয়া হয় না।
          </p>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: isMobile ? "12px" : "15px",
            padding: isMobile ? "12px 13px" : "14px 16px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: isMobile ? "11.5px" : "12px",
              fontWeight: "700",
              color: "#7dd3fc",
              marginBottom: "6px",
            }}
          >
            স্টকের ঔষধ ও নীতিমালা
          </div>
          <p
            style={{
              margin: 0,
              fontSize: isMobile ? "12.5px" : "13px",
              lineHeight: 1.6,
              color: "#e2e8f0",
              wordBreak: "break-word",
            }}
          >
            আমাদের ফার্মেসিতে যেসব মেডিসিন পাওয়া যায় শুধু সেগুলোই এই ওয়েবসাইটে
            দেওয়া হয়েছে। এর বাইরে আমরা কোনো বিদেশি ঔষধ সেল করি না।
          </p>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: isMobile ? "12px" : "15px",
            padding: isMobile ? "12px 13px" : "14px 16px",
            minWidth: 0,
            gridColumn: isTablet ? "1 / -1" : "auto",
          }}
        >
          <div
            style={{
              fontSize: isMobile ? "11.5px" : "12px",
              fontWeight: "700",
              color: "#7dd3fc",
              marginBottom: "6px",
            }}
          >
            যোগাযোগ ও পরামর্শ
          </div>
          <p
            style={{
              margin: 0,
              fontSize: isMobile ? "12.5px" : "13px",
              lineHeight: 1.6,
              color: "#e2e8f0",
              wordBreak: "break-word",
            }}
          >
            যেকোনো ঔষধের পরামর্শ জানতে ফার্মেসিতে ভিজিট করুন অথবা কল করুন{" "}
            <a
              href="tel:01940195143"
              style={{
                color: "#7dd3fc",
                fontWeight: "800",
                textDecoration: "none",
              }}
            >
              01940195143
            </a>
            ।
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          paddingTop: isMobile ? "12px" : "16px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? "6px" : "12px",
          fontSize: isMobile ? "11.5px" : "12.5px",
          color: "#cbd5e1",
        }}
      >
        <span>
          © {new Date().getFullYear()} Sheikh Drugs House. সর্বস্বত্ব সংরক্ষিত।
        </span>
        <span
          style={{
            color: "#fde68a",
            fontWeight: "600",
          }}
        >
          চিকিৎসকের পরামর্শ অনুযায়ী ঔষধ সেবন করুন।
        </span>
      </div>
    </footer>
  );
}