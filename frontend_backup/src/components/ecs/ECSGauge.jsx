import { getECSBand } from "../../utils/ecsCalculator";
export default function ECSGauge({ score=0, size=120, showLabel=true }) {
  const max = 850;
  const pct = Math.min(score/max, 1);
  const circ = 2*Math.PI*42;
  const offset = circ*(1-pct*0.75);
  const band = getECSBand(score);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
      <svg width={size} height={size*0.65} viewBox="0 0 100 65">
        <circle cx="50" cy="55" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" strokeDasharray={circ} strokeDashoffset={circ*0.25} strokeLinecap="round" transform="rotate(135 50 55)" />
        <circle cx="50" cy="55" r="42" fill="none" stroke={band.color} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(135 50 55)" style={{ transition:"stroke-dashoffset 1.2s ease,stroke 0.5s" }} />
        <text x="50" y="52" textAnchor="middle" fill={band.color} fontSize="17" fontWeight="900" fontFamily="Sora,sans-serif">{score}</text>
        <text x="50" y="62" textAnchor="middle" fill="#555" fontSize="6" fontFamily="DM Mono,monospace">/ {max}</text>
      </svg>
      {showLabel && <div style={{ fontSize:11, fontWeight:700, color:band.color, fontFamily:"DM Mono,monospace", letterSpacing:1 }}>{band.label.toUpperCase()}</div>}
    </div>
  );
}