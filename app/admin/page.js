"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [viewport, setViewport] = useState("desktop"); // "mobile" | "tablet" | "desktop"
  const router = useRouter();

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

  const isMobile = viewport === "mobile";
  const isTablet = viewport === "tablet";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        localStorage.setItem("isAdminLoggedIn", "true");
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Email ba password vul hoyeche!");
        setSubmitting(false);
      }
    } catch {
      setError("Server-e connect kora jayni!");
      setSubmitting(false);
    }
  };

  return (
    <main
      className="container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100dvh",
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        padding: isMobile ? "14px" : isTablet ? "24px 20px" : "32px 24px",
        boxSizing: "border-box",
        overflowX: "hidden",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: isMobile ? "22px 16px" : isTablet ? "30px 26px" : "36px 32px",
          borderRadius: isMobile ? "18px" : "24px",
          boxShadow:
            "0 24px 48px -12px rgba(0, 0, 0, 0.45), 0 8px 20px -6px rgba(15, 23, 42, 0.25)",
          width: "100%",
          maxWidth: "430px",
          border: "1px solid rgba(191, 219, 254, 0.85)",
          boxSizing: "border-box",
        }}
      >
        {/* Top Bar: Home Link & Brand Badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "22px",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            className="back-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: isMobile ? "12.5px" : "13.5px",
              fontWeight: "700",
              color: "#1e3a8a",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              padding: "6px 12px",
              borderRadius: "10px",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            ← Home
          </Link>

          <span
            style={{
              fontSize: isMobile ? "11px" : "11.5px",
              fontWeight: "700",
              color: "#1d4ed8",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              padding: "5px 11px",
              borderRadius: "999px",
            }}
          >
            Sheikh Drugs Pharma
          </span>
        </div>

        {/* Original Pharma Emblem Logo + Title */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <span
            style={{
              width: isMobile ? "48px" : "56px",
              height: isMobile ? "48px" : "56px",
              margin: "0 auto 12px auto",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, #0ea5e9 0%, #2563eb 55%, #1d4ed8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 10px 22px -5px rgba(37, 99, 235, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.45)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={isMobile ? "24" : "28"}
              height={isMobile ? "24" : "28"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
              <path d="m8.5 8.5 7 7" />
              <circle cx="18" cy="6" r="1" fill="#ffffff" stroke="none" />
            </svg>
          </span>

          <h2
            style={{
              color: "#0f172a",
              margin: "0 0 6px 0",
              fontSize: isMobile ? "20px" : "24px",
              fontWeight: "800",
              letterSpacing: "-0.02em",
            }}
          >
            Admin Login
          </h2>
          <p
            style={{
              color: "#475569",
              margin: 0,
              fontSize: isMobile ? "13px" : "13.5px",
              lineHeight: "1.5",
            }}
          >
            ড্যাশবোর্ডে প্রবেশ করতে ইমেইল ও পাসওয়ার্ড দিন
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#dc2626",
              fontSize: "13px",
              textAlign: "center",
              marginBottom: "18px",
              padding: "10px 14px",
              borderRadius: "12px",
              fontWeight: "700",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label
              htmlFor="admin-email"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "6px",
              }}
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="search-input"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: isMobile ? "11px 14px" : "12px 16px",
                borderRadius: "12px",
                fontSize: isMobile ? "14px" : "15px",
                background: "#f8fafc",
                color: "#0f172a",
                border: "1.5px solid #cbd5e1",
                outline: "none",
              }}
              required
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="search-input"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: isMobile ? "11px 14px" : "12px 16px",
                borderRadius: "12px",
                fontSize: isMobile ? "14px" : "15px",
                background: "#f8fafc",
                color: "#0f172a",
                border: "1.5px solid #cbd5e1",
                outline: "none",
              }}
              required
            />

            {/* Password Box-এর নিচে Eye Button */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                marginTop: "8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: showPassword ? "#dbeafe" : "#f1f5f9",
                border: showPassword ? "1px solid #93c5fd" : "1px solid #cbd5e1",
                borderRadius: "9px",
                padding: "6px 11px",
                fontSize: "12.5px",
                fontWeight: "700",
                color: showPassword ? "#1d4ed8" : "#334155",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a21.85 21.85 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
              <span>{showPassword ? "Hide Password" : "Show Password"}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: submitting
                ? "#93c5fd"
                : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              padding: isMobile ? "12px 16px" : "14px 20px",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: isMobile ? "14px" : "15px",
              cursor: submitting ? "not-allowed" : "pointer",
              marginTop: "6px",
              boxShadow: "0 10px 22px -6px rgba(29, 78, 216, 0.5)",
              transition: "all 0.2s ease",
            }}
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}