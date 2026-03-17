export default function ClientTrustScore({ score=0, totalProjects=0, onTimePayments=0 }) {
  const stars = Math.round(score);
  const color = score>=4?"#4ECDC4":score>=3?"#FFD93D":"#FF6B35";
  return (
    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:18, fontWeight:800, color }}>{score.toFixed(1)}</div>
        <div style={{ fontSize:12, color }}>{"★".repeat(stars)}{"☆".repeat(5-stars)}</div>
        <div style={{ fontSize:9, color:"#555", fontFamily:"DM Mono,monospace" }}>CLIENT TRUST</div>
      </div>
      <div style={{ fontSize:12, color:"#888" }}>
        <div>{totalProjects} projects completed</div>
        <div>{onTimePayments}% on-time payments</div>
      </div>
    </div>
  );
}