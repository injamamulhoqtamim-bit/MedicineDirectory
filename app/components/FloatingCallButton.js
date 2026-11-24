"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const VISIBLE_DURATION_MS = 4000; // ৪ সেকেন্ড দেখাবে
const CYCLE_INTERVAL_MS = 60000; // প্রতি ১ মিনিট (৬০,০০০ ms) পরপর আবার দেখাবে

export default function FloatingCallButton() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const [viewport, setViewport] = useState("desktop"); // "mobile" | "tablet" | "desktop"
  const [showResponsiveLabel, setShowResponsiveLabel] = useState(true);

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
    if (viewport === "desktop") {
      setShowResponsiveLabel(true);
      return;
    }

    // Responsive মোডে প্রথমে show হবে, তারপর VISIBLE_DURATION_MS পরে off হবে
    setShowResponsiveLabel(true);
    let hideTimeout = setTimeout(() => {
      setShowResponsiveLabel(false);
    }, VISIBLE_DURATION_MS);

    // প্রতি ১ মিনিট পরপর show হবে এবং VISIBLE_DURATION_MS পরে আবার off হবে
    const cycleInterval = setInterval(() => {
      setShowResponsiveLabel(true);
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        setShowResponsiveLabel(false);
      }, VISIBLE_DURATION_MS);
    }, CYCLE_INTERVAL_MS);

    return () => {
      clearTimeout(hideTimeout);
      clearInterval(cycleInterval);
    };
  }, [viewport]);

  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  const isMobile = viewport === "mobile";
  const isTablet = viewport === "tablet";
  const isDesktop = viewport === "desktop";
  const shouldShowLabel = isDesktop || showResponsiveLabel;

  const buttonSize = isMobile ? 52 : isTablet ? 56 : 62;
  const iconSize = isMobile ? 20 : isTablet ? 22 : 25;

  return (
    <>
      <style>{`
        @keyframes sdhOuterWave {
          0% {
            transform: scale(0.96);
            opacity: 0.65;
          }
          75% {
            transform: scale(1.42);
            opacity: 0;
          }
          100% {
            transform: scale(1.42);
            opacity: 0;
          }
        }

        @keyframes sdhInnerRing {
          0%, 100% {
            transform: scale(1);
            opacity: 0.95;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.55;
          }
        }

        @keyframes sdhFloatGentle {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes sdhPhoneRing {
          0%, 72%, 100% {
            transform: rotate(0deg);
          }
          76% {
            transform: rotate(-12deg);
          }
          80% {
            transform: rotate(12deg);
          }
          84% {
            transform: rotate(-10deg);
          }
          88% {
            transform: rotate(8deg);
          }
          92% {
            transform: rotate(0deg);
          }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          right: isMobile
            ? "max(14px, env(safe-area-inset-right))"
            : isTablet
            ? "20px"
            : "26px",
          bottom: isMobile
            ? "max(14px, env(safe-area-inset-bottom))"
            : isTablet
            ? "20px"
            : "26px",
          zIndex: 999,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: shouldShowLabel ? (isMobile ? "8px" : "10px") : "0px",
          maxWidth: "calc(100vw - 28px)",
          animation: hovered ? "none" : "sdhFloatGentle 3.2s ease-in-out infinite",
        }}
      >
        <a
          href="tel:01940195143"
          aria-label="কল করুন"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            textDecoration: "none",
            background: "linear-gradient(135deg, #090e1a 0%, #1e293b 100%)",
            color: "#ffffff",
            border: shouldShowLabel
              ? "1px solid rgba(147, 197, 253, 0.36)"
              : "none",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            padding: shouldShowLabel
              ? isMobile
                ? "7px 13px"
                : isTablet
                ? "9px 16px"
                : "10px 18px"
              : "0px",
            borderRadius: "999px",
            boxShadow: shouldShowLabel
              ? hovered
                ? "0 14px 28px -8px rgba(15, 23, 42, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
                : "0 10px 22px -8px rgba(15, 23, 42, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
              : "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isMobile ? "12px" : isTablet ? "13px" : "14px",
            fontWeight: "800",
            letterSpacing: "0.01em",
            lineHeight: 1.2,
            maxWidth: shouldShowLabel ? "140px" : "0px",
            opacity: shouldShowLabel ? 1 : 0,
            overflow: "hidden",
            pointerEvents: shouldShowLabel ? "auto" : "none",
            transform: hovered
              ? "translateY(-2px)"
              : shouldShowLabel
              ? "translateX(0)"
              : "translateX(8px)",
            transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
            whiteSpace: "nowrap",
            boxSizing: "border-box",
          }}
        >
          কল করুন
        </a>

        <div
          style={{
            position: "relative",
            width: `${buttonSize}px`,
            height: `${buttonSize}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "rgba(37, 99, 235, 0.32)",
              animation: "sdhOuterWave 2.1s cubic-bezier(0.22, 1, 0.36, 1) infinite",
              pointerEvents: "none",
            }}
          />

          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: isMobile ? "-3px" : "-4px",
              borderRadius: "50%",
              border: "1.5px solid rgba(125, 211, 252, 0.55)",
              animation: "sdhInnerRing 2.1s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          <a
            href="tel:01940195143"
            aria-label="Call Sheikh Drugs House"
            title="কল করুন"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #3b82f6 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              boxShadow: hovered
                ? "0 18px 34px -6px rgba(37, 99, 235, 0.75)"
                : "0 12px 24px -6px rgba(29, 78, 216, 0.55)",
              border: "2.5px solid rgba(255, 255, 255, 0.95)",
              transform: hovered ? "translateY(-2px) scale(1.06)" : "scale(1)",
              transition: "all 0.2s ease",
              boxSizing: "border-box",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={iconSize}
              height={iconSize}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: "sdhPhoneRing 3.4s ease-in-out infinite",
                transformOrigin: "center",
              }}
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}