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
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

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

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("isAdminLoggedIn", "true");
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Email ba password vul hoyeche!");
        setSubmitting(false);
      }
    } catch (err) {
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
        minHeight: "100vh",
        width: "100%",
        padding: isMobile ? "16px" : "28px 20px",
        boxSizing: "border-box",
        background:
          "radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 45%), radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.06), transparent 45%)",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.98)",
          padding: isMobile ? "24px 18px" : "36px 32px",
          borderRadius: isMobile ? "20px" : "24px",
          boxShadow:
            "0 20px 35px -10px rgba(15, 23, 42, 0.08), 0 4px 12px -4px rgba(15, 23, 42, 0.04)",
          width: "100%",
          maxWidth: "420px",
          border: "1px solid #e2e8f0",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "22px",
            gap: "10px",
          }}
        >
          <Link
            href="/"
            className="back-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "13.5px",
              fontWeight: "600",
              color: "#475569",
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>

          <span
            style={{
              fontSize: "11.5px",
              fontWeight: "700",
              color: "#2563eb",
              background: "#eff6ff",
              border: "1px solid #dbeafe",
              padding: "4px 10px",
              borderRadius: "999px",
            }}
          >
            MedDirectory Admin
          </span>
        </div>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 12px auto",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              boxShadow: "0 10px 20px -6px rgba(37, 99, 235, 0.45)",
            }}
          >
            🔐
          </div>
          <h2
            style={{
              color: "#0f172a",
              margin: "0 0 6px 0",
              fontSize: isMobile ? "21px" : "24px",
              fontWeight: "800",
            }}
          >
            Admin Login
          </h2>
          <p
            style={{
              color: "#64748b",
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
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: "13.5px",
              textAlign: "center",
              marginBottom: "18px",
              padding: "10px 14px",
              borderRadius: "12px",
              fontWeight: "600",
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
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Email
            </label>
            <input
              type="email"
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
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
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
                background: showPassword ? "#eff6ff" : "#f8fafc",
                border: showPassword ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                borderRadius: "9px",
                padding: "6px 11px",
                fontSize: "12.5px",
                fontWeight: "600",
                color: showPassword ? "#1d4ed8" : "#475569",
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
                  strokeWidth="2"
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
                  strokeWidth="2"
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
              color: "white",
              padding: isMobile ? "12px 16px" : "14px 20px",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "15px",
              cursor: submitting ? "not-allowed" : "pointer",
              marginTop: "6px",
              boxShadow: "0 10px 20px -6px rgba(37, 99, 235, 0.45)",
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