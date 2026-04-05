export default function FakeHomePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      {/* Top nav */}
      <header style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 32px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30,
            height: 30,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
          }}>A</div>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>Acme Corp</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>Projects</span>
          <span style={{ fontSize: 13, color: "#64748b" }}>Team</span>
          <span style={{ fontSize: 13, color: "#64748b" }}>Settings</span>
          <span
            aria-label="User menu"
            role="button"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            A
          </span>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 32px" }}>
        <section aria-label="Dashboard content">
          {/* Welcome card */}
          <div
            role="status"
            aria-label="Welcome message"
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "28px 32px",
              marginBottom: 24,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", margin: "0 0 6px" }}>
              Welcome back, Admin
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
              You are logged in to Acme Corp. Here&apos;s your workspace overview.
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Active projects", value: "12", sub: "+2 this week" },
              { label: "Team members", value: "34", sub: "3 pending invites" },
              { label: "Storage used", value: "67%", sub: "4.2 GB of 6 GB" },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "20px 24px",
              }}>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: 28, fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "24px 32px",
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 16px" }}>
              Recent Activity
            </h3>
            {[
              { action: "Deployed v2.4.1 to production", time: "2 hours ago", user: "Sarah K." },
              { action: "Updated team permissions", time: "5 hours ago", user: "Admin" },
              { action: "Created project: Q2 Launch", time: "1 day ago", user: "Mike R." },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderTop: i > 0 ? "1px solid #f1f5f9" : "none",
              }}>
                <div>
                  <p style={{ fontSize: 13, color: "#0f172a", margin: "0 0 2px" }}>{item.action}</p>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{item.user}</p>
                </div>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{item.time}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
