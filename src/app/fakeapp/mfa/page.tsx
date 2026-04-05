"use client";

import { useRouter } from "next/navigation";

export default function FakeMfaPage() {
  const router = useRouter();

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    router.push("/fakeapp/home");
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
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
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
        </div>

        {/* Shield icon */}
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          <div style={{
            display: "inline-flex",
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#f0f0ff",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", margin: "0 0 6px" }}>
            Two-Factor Authentication
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: 24 }}>
            <label htmlFor="code" style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "#374151",
              marginBottom: 6,
            }}>Verification Code</label>
            <input
              id="code"
              type="text"
              aria-label="Verification code"
              placeholder="000 000"
              maxLength={6}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 14px",
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: "0.3em",
                textAlign: "center",
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
            aria-label="Verify"
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
            }}
          >
            Verify
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: 13, color: "#94a3b8", cursor: "pointer" }}>
            Didn&apos;t receive a code? Resend
          </span>
        </div>

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
