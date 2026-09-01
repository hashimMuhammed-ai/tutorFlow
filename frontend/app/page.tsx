export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 100%)",
      color: "#f8fafc",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      textAlign: "center"
    }}>
      <div style={{
        maxWidth: "640px",
        width: "100%",
        padding: "2.5rem",
        background: "rgba(30, 41, 59, 0.7)",
        backdropFilter: "blur(12px)",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}>
        <div style={{
          display: "inline-block",
          padding: "0.4rem 1rem",
          borderRadius: "9999px",
          background: "rgba(99, 102, 241, 0.2)",
          color: "#818cf8",
          fontSize: "0.875rem",
          fontWeight: "600",
          marginBottom: "1.5rem",
          border: "1px solid rgba(129, 140, 248, 0.3)"
        }}>
          Day 1 Deployment Pipeline
        </div>
        
        <h1 style={{
          fontSize: "3rem",
          fontWeight: "800",
          margin: "0 0 1rem 0",
          background: "linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Hello TutorFlow
        </h1>

        <p style={{
          fontSize: "1.125rem",
          color: "#94a3b8",
          lineHeight: "1.6",
          marginBottom: "2rem"
        }}>
          1:1 Tutoring Session Lifecycle & AI Progress Platform
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "2rem",
          textAlign: "left"
        }}>
          <div style={{
            padding: "1rem 1.25rem",
            background: "rgba(15, 23, 42, 0.6)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Frontend</div>
            <div style={{ fontSize: "1rem", fontWeight: "600", color: "#34d399", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399" }}></span>
              Next.js 16 (Vercel)
            </div>
          </div>

          <div style={{
            padding: "1rem 1.25rem",
            background: "rgba(15, 23, 42, 0.6)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Backend API</div>
            <div style={{ fontSize: "1rem", fontWeight: "600", color: "#818cf8", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#818cf8" }}></span>
              NestJS (Render)
            </div>
          </div>
        </div>

        <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
          Pipeline verification complete • Ready for DB & Auth setup
        </p>
      </div>
    </main>
  );
}

