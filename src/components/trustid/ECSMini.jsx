import { getECSBand } from "../../utils/ecsCalculator";
export default function ECSMini({ score=0, showBar=true }) {
  const band = getECSBand(score);
  const pct  = (score/850)*100;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div>
        <span style={{ fontSize:16, fontWeight:900, color:band.color }}>{score}</span>
        <span style={{ fontSize:9, color:band.color, marginLeft:3, fontFamily:"DM Mono,monospace" }}>{band.label.toUpperCase()}</span>
      </div>
      {showBar && <div style={{ width:60, height:4, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:band.color, borderRadius:2 }} />
      </div>}
    </div>
  );
}