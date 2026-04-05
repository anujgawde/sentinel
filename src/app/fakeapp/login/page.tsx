"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FakeLoginPage() {
  const router = useRouter();
  const [driftMode, setDriftMode] = useState(false);

  useEffect(() => {
    fetch("/api/drift-config")
      .then((r) => r.json())
      .then((c) => setDriftMode(c.driftMode))
      .catch(() => {});
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (driftMode) {
      router.push("/fakeapp/mfa");
    } else {
      router.push("/fakeapp/home");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        width: 420,
        background: "#ffffff",
        borderRadius: 16,
        padding: "40px 36px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}>
            <div style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 18,
              fontWeight: 700,
            }}>A</div>
            <span style={{ fontSize: 22, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Acme Corp
            </span>
          </div>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
            Sign in to your workspace
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="email" style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "#374151",
              marginBottom: 6,
            }}>Email address</label>
            <input
              id="email"
              type="email"
              aria-label="Email address"
              placeholder="you@acmecorp.com"
              defaultValue="admin@acmecorp.com"
              style={{
                display: "block",
                width: "100%",
                padding: "10px 14px",
                fontSize: 14,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                outline: "none",
                background: "#f8fafc",
                color: "#0f172a",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label htmlFor="password" style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#374151",
              }}>Password</label>
              <span style={{ fontSize: 12, color: "#6366f1", cursor: "pointer" }}>Forgot password?</span>
            </div>
            <input
              id="password"
              type="password"
              aria-label="Password"
              placeholder="Enter your password"
              defaultValue="password123"
              style={{
                display: "block",
                width: "100%",
                padding: "10px 14px",
                fontSize: 14,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                outline: "none",
                background: "#f8fafc",
                color: "#0f172a",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            type="submit"
            role="button"
            aria-label={driftMode ? "Log In" : "Sign In"}
            style={{
              width: "100%",
              padding: "11px 0",
              background: "linear-gradient(135deg, #6366f1, #7c3aed)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            {driftMode ? "Log In" : "Sign In"}
          </button>
        </form>

        <div style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid #f1f5f9",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            Protected by Aglide SSO &middot; Zero-knowledge encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
