"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // Nijer ichchamoto email ebong password set kore nite paren
    if (email === "admin@gmail.com" && password === "123456") {
      localStorage.setItem("isAdminLoggedIn", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Email ba password vul hoyeche!");
    }
  };

  return (
    <main className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", width: "100%", maxWidth: "400px", border: "1px solid #e2e8f0" }}>
        <Link href="/" className="back-link" style={{ marginBottom: "20px" }}>← Home</Link>
        <h2 style={{ color: "#1e293b", marginBottom: "20px", textAlign: "center" }}>🔐 Admin Login</h2>
        
        {error && <p style={{ color: "#ef4444", fontSize: "14px", textAlign: "center", marginBottom: "15px" }}>{error}</p>}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Email</label>
            <input
              type="email"
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="search-input"
              style={{ marginTop: "5px" }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Password</label>
            <input
              type="password"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="search-input"
              style={{ marginTop: "5px" }}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              background: "#2563eb",
              color: "white",
              padding: "14px",
              border: "none",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "10px"
            }}
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}