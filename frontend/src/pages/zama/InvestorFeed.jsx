import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function InvestorInterestCard({ interest }) {
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(interest.status !== "expressed");

  const respond = async (accept) => {
    setResponding(true);
    try {
      await api.post(`/investors/interest/${interest.interest_id}/respond`, { accept, entrepreneur_response: accept ? "Thank you for your interest. I'd love to connect." : "Thank you, but I'm not available at this time." });
      setResponded(true);
      interest.status = accept ? "accepted" : "declined";
    } catch { setResponded(true); }
    finally { setResponding(false); }
  };

  const statusColors = { expressed: "#FFD93D", accepted: "#4ECDC4", declined: "#555", in_discussion: "#FF6B35" };
  const statusColor = statusColors[interest.status] || "#666";

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${statusColor}25`, borderRadius: 14, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{interest.investor?.name || "Verified Investor"}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{interest.investor?.investor_type} · {interest.investor?.organization}</div>
        </div>
        <span style={{ fontSize: 10, background: `${statusColor}15`, border: `1px solid ${statusColor}30`, borderRadius: 12, padding: "3px 10px", color: statusColor, fontWeight: 700, fontFamily: "DM Mono, monospace" }}>
          {interest.status?.toUpperCase()}
        </span>
      </div>

      {interest.investor_message && (
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 13, color: "#AAA", lineHeight: 1.6, fontStyle: "italic" }}>
          "{interest.investor_message}"
        </div>
      )}

      {interest.investment_amount_proposed && (
        <div style={{ fontSize: 14, fontWeight: 700, color: "#FFD93D", marginBottom: 12 }}>
          Proposed: R{interest.investment_amount_proposed?.toLocaleString()} · {interest.investment_instrument}
        </div>
      )}

      <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", marginBottom: 12 }}>
        {new Date(interest.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
      </div>

      {!responded && interest.status === "expressed" ? (
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => respond(true)} disabled={responding} style={{ flex: 2, background: "#4ECDC4", color: "#0A0A0F", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif" }}>
            ✓ Accept & Connect
          </button>
          <button onClick={() => respond(false)} disabled={responding} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", borderRadius: 8, padding: "10px", fontSize: 13, cursor: "pointer", fontFamily: "Sora, sans-serif" }}>
            Decline
          </button>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: statusColor, fontWeight: 600 }}>
          {interest.status === "accepted" ? "✓ Contact shared — check your messages" : interest.status === "declined" ? "✗ Declined" : `Status: ${interest.status}`}
        </div>
      )}
    </div>
  );
}

export default function InvestorFeed() {
  const { user, updateUser } = useAuth();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibilityOn, setVisibilityOn] = useState(user?.is_visible_to_investors || false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/investors/my-interests");
        setInterests(res.data.interests || MOCK_INTERESTS);
      } catch { setInterests(MOCK_INTERESTS); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const toggleVisibility = async () => {
    setToggling(true);
    try {
      await api.patch("/users/me", { is_visible_to_investors: !visibilityOn });
      setVisibilityOn(!visibilityOn);
      updateUser({ is_visible_to_investors: !visibilityOn });
    } catch {}
    finally { setToggling(false); }
  };

  const pending = interests.filter((i) => i.status === "expressed").length;

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={styles.inner}>
        <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
          <h1 style={styles.title}>Investor Connect</h1>
          <p style={{ fontSize: 14, color: "#888" }}>You are always in control. Investors can only contact you after you accept.</p>
        </div>

        {/* Visibility toggle */}
        <div style={{ background: visibilityOn ? "rgba(78,205,196,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${visibilityOn ? "rgba(78,205,196,0.25)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Investor Visibility</div>
            <div style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>
              {visibilityOn ? "✓ Your business profile is visible to verified investors. They can discover and express interest." : "Your profile is hidden from investors. Toggle on when you're ready to be discovered."}
            </div>
          </div>
          <button onClick={toggleVisibility} disabled={toggling} style={{ background: visibilityOn ? "#4ECDC4" : "rgba(255,255,255,0.08)", color: visibilityOn ? "#0A0A0F" : "#888", border: "none", borderRadius: 30, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Sora, sans-serif", flexShrink: 0, transition: "all 0.2s" }}>
            {toggling ? "..." : visibilityOn ? "● Visible" : "○ Hidden"}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Total Interest", value: interests.length, color: "#E8E8F0" },
            { label: "Awaiting Response", value: pending, color: "#FFD93D" },
            { label: "Connected", value: interests.filter((i) => i.status === "accepted").length, color: "#4ECDC4" },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace" }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Safety notice */}
        <div style={{ background: "rgba(255,107,53,0.05)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10 }}>
          <span>🛡️</span>
          <span style={{ fontSize: 13, color: "#AAA" }}>
            <strong style={{ color: "#E8E8F0" }}>You're protected.</strong> Contact details are only shared after you accept. All investors are identity-verified and have agreed to ARISE's anti-exploitation terms.
          </span>
        </div>

        {/* Interest cards */}
        <div>
          <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 14 }}>
            INVESTOR INTERESTS {pending > 0 && `· ${pending} PENDING RESPONSE`}
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📈</div>
              <div style={{ fontFamily: "DM Mono, monospace", fontSize: 13 }}>Loading investor interests...</div>
            </div>
          ) : interests.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#666", background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No investor interest yet</div>
              <div style={{ fontSize: 13, maxWidth: 340, margin: "0 auto", lineHeight: 1.6 }}>
                {!visibilityOn ? "Turn on investor visibility above to start being discovered." : "Complete your business profile and ECS score to attract investors."}
              </div>
              {!visibilityOn && <button onClick={toggleVisibility} style={{ marginTop: 16, background: "#FFD93D", color: "#0A0A0F", border: "none", padding: "10px 24px", borderRadius: 8, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif" }}>Turn On Visibility →</button>}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {interests.map((interest, i) => (
                <div key={interest.interest_id} style={{ animation: `fadeUp 0.4s ${i * 0.05}s ease both` }}>
                  <InvestorInterestCard interest={interest} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ textAlign: "center" }}>
          <Link to="/business-profile" style={{ fontSize: 13, color: "#FF6B35", textDecoration: "none", fontWeight: 600 }}>
            Update your business profile to attract better-matched investors →
          </Link>
        </div>
      </div>
    </div>
  );
}

const MOCK_INTERESTS = [
  { interest_id: "i1", status: "expressed", investor_message: "Hi, I've been following your sector closely and your profile really stood out. I'd love to learn more about your traction.", investment_amount_proposed: 250000, investment_instrument: "equity", created_at: new Date(Date.now() - 86400000 * 2).toISOString(), investor: { name: "Verified Investor", investor_type: "Angel", organization: "Cape Angel Network", focus_sectors: ["Fashion", "Retail"] } },
  { interest_id: "i2", status: "accepted", investor_message: "Your ECS score and mentorship history really impressed us.", investment_amount_proposed: 500000, investment_instrument: "convertible", created_at: new Date(Date.now() - 86400000 * 7).toISOString(), investor: { name: "Naledi Dlamini", investor_type: "VC", organization: "Savannah Fund SA", focus_sectors: ["Technology", "Fashion"] } },
];

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  title: { fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, marginBottom: 4 },
};