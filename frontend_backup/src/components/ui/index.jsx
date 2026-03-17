/**
 * src/components/ui/index.jsx
 * Shared reusable UI components used across all ARISE pages.
 * Import: import { ECSGauge, TrustBadge, MatchScore, Spinner, EmptyState, ErrorBanner } from "../components/ui";
 */

// ── Loading Spinner ───────────────────────────────────────────────────────────
export function Spinner({ size = 24, color = "#FF6B35" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid rgba(255,255,255,0.08)`,
      borderTopColor: color,
      animation: "spin 0.8s linear infinite",
      flexShrink: 0,
    }} />
  );
}

// ── Full-page loader ──────────────────────────────────────────────────────────
export function PageLoader({ message = "Loading..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100vh", background: "#0A0A0F", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12,
        background: "linear-gradient(135deg,#FF6B35,#FF3D00)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚡</div>
      <div style={{ fontSize: 13, color: "#FF6B35", fontFamily: "DM Mono,monospace",
        animation: "pulse 1.5s ease-in-out infinite" }}>{message}</div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── ECS Score Gauge ───────────────────────────────────────────────────────────
export function ECSGauge({ score = 0, size = 120, showLabel = true }) {
  const max = 850;
  const pct = Math.min(score / max, 1);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - pct * 0.75);
  const color = score >= 750 ? "#A8E6CF" : score >= 650 ? "#4ECDC4"
    : score >= 500 ? "#FFD93D" : score >= 300 ? "#FF6B35" : "#666";
  const band = score >= 750 ? "Elite" : score >= 650 ? "Thriving"
    : score >= 500 ? "Established" : score >= 300 ? "Developing" : "Building";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size * 0.65} viewBox="0 0 100 65">
        {/* Background arc */}
        <circle cx="50" cy="55" r="42" fill="none" stroke="rgba(255,255,255,0.06)"
          strokeWidth="6" strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round" transform="rotate(135 50 55)" />
        {/* Score arc */}
        <circle cx="50" cy="55" r="42" fill="none" stroke={color}
          strokeWidth="6" strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(135 50 55)"
          style={{ transition: "stroke-dashoffset 1.2s ease, stroke 0.5s ease" }} />
        <text x="50" y="52" textAnchor="middle" fill={color}
          fontSize="17" fontWeight="900" fontFamily="Sora,sans-serif">{score}</text>
        <text x="50" y="62" textAnchor="middle" fill="#555"
          fontSize="6" fontFamily="DM Mono,monospace">/ {max}</text>
      </svg>
      {showLabel && (
        <div style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "DM Mono,monospace",
          letterSpacing: 1 }}>{band.toUpperCase()}</div>
      )}
    </div>
  );
}

// ── Trust Completion Bar ──────────────────────────────────────────────────────
export function TrustBar({ score = 0, showPct = true }) {
  const color = score >= 80 ? "#4ECDC4" : score >= 60 ? "#FFD93D" : "#FF6B35";
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono,monospace" }}>TRUSTID</span>
        {showPct && <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "DM Mono,monospace" }}>{Math.round(score)}%</span>}
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: color,
          borderRadius: 2, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

// ── Match Score Badge ─────────────────────────────────────────────────────────
export function MatchScore({ score = 0, size = "md" }) {
  const color = score >= 80 ? "#4ECDC4" : score >= 60 ? "#FFD93D" : score >= 40 ? "#FF6B35" : "#666";
  const label = score >= 80 ? "High Match" : score >= 60 ? "Good" : score >= 40 ? "Partial" : "Low";
  const fontSize = size === "lg" ? 28 : size === "sm" ? 13 : 18;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize, fontWeight: 900, color, lineHeight: 1 }}>{score}%</div>
      <div style={{ fontSize: 9, color, fontFamily: "DM Mono,monospace", marginTop: 2, fontWeight: 700 }}>{label.toUpperCase()}</div>
    </div>
  );
}

// ── Verification Badge ────────────────────────────────────────────────────────
export function TrustBadge({ type, size = "md" }) {
  const badges = {
    verified:   { icon: "✓", label: "Verified",    color: "#4ECDC4", bg: "rgba(78,205,196,0.1)"  },
    identity:   { icon: "🪪", label: "ID Verified", color: "#4ECDC4", bg: "rgba(78,205,196,0.1)"  },
    email:      { icon: "✉️", label: "Email",       color: "#4ECDC4", bg: "rgba(78,205,196,0.1)"  },
    education:  { icon: "🎓", label: "Education",   color: "#FFD93D", bg: "rgba(255,215,61,0.1)"  },
    work:       { icon: "💼", label: "Work",        color: "#FF6B35", bg: "rgba(255,107,53,0.1)"  },
    skill:      { icon: "⚡", label: "Assessed",    color: "#FF6B35", bg: "rgba(255,107,53,0.1)"  },
    cipc:       { icon: "🏢", label: "CIPC",        color: "#4ECDC4", bg: "rgba(78,205,196,0.1)"  },
    bbee:       { icon: "🤝", label: "B-BBEE ED",   color: "#A8E6CF", bg: "rgba(168,230,207,0.1)" },
    unverified: { icon: "○", label: "Unverified",   color: "#555",    bg: "rgba(255,255,255,0.04)" },
  };
  const b = badges[type] || badges.unverified;
  const pad = size === "sm" ? "2px 8px" : "4px 12px";
  const fs  = size === "sm" ? 10 : 12;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
      background: b.bg, border: `1px solid ${b.color}40`,
      borderRadius: 20, padding: pad, fontSize: fs, fontWeight: 700, color: b.color }}>
      <span style={{ fontSize: fs + 1 }}>{b.icon}</span>{b.label}
    </span>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = "📭", title = "Nothing here yet", desc = "", action = null }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px",
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14, color: "#666" }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#888", marginBottom: 6 }}>{title}</div>
      {desc && <div style={{ fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>{desc}</div>}
      {action}
    </div>
  );
}

// ── Error Banner ──────────────────────────────────────────────────────────────
export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)",
      borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#FF8888",
      display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span>⚠ {message}</span>
      {onDismiss && <button onClick={onDismiss} style={{ background: "none", border: "none",
        color: "#FF8888", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>}
    </div>
  );
}

// ── Success Banner ────────────────────────────────────────────────────────────
export function SuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{ background: "rgba(78,205,196,0.08)", border: "1px solid rgba(78,205,196,0.25)",
      borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#4ECDC4" }}>
      ✓ {message}
    </div>
  );
}

// ── ECS Points Award Toast ────────────────────────────────────────────────────
export function ECSToast({ points, message }) {
  return (
    <div style={{ background: "#141420", border: "1px solid rgba(255,107,53,0.3)",
      borderRadius: 12, padding: "14px 18px", display: "flex", gap: 12, alignItems: "center",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)", animation: "fadeUp 0.3s ease" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10,
        background: "linear-gradient(135deg,#FF6B35,#FF3D00)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⭐</div>
      <div>
        <div style={{ fontWeight: 800, color: "#FF6B35", fontSize: 15 }}>+{points} ECS points!</div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{message}</div>
      </div>
    </div>
  );
}

// ── Section Title ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono,monospace",
      fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>
      {children}
    </div>
  );
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────
export function Toggle({ value, onChange, label, desc, color = "#FF6B35" }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{desc}</div>}
      </div>
      <button onClick={() => onChange(!value)} style={{
        width: 44, height: 24, borderRadius: 12,
        background: value ? color : "rgba(255,255,255,0.1)",
        border: "none", cursor: "pointer", position: "relative",
        flexShrink: 0, transition: "background 0.2s",
      }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 3, left: value ? 23 : 3,
          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
      </button>
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
export function SkeletonCard({ lines = 3 }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, padding: 20 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{ height: 14, borderRadius: 7, marginBottom: i < lines - 1 ? 12 : 0,
          width: i === 0 ? "60%" : i === lines - 1 ? "40%" : "90%",
          background: "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)",
          backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      ))}
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </div>
  );
}