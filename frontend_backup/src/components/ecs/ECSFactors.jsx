import { FACTOR_WEIGHTS } from "../../utils/ecsCalculator";
export default function ECSFactors({ breakdown={} }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {Object.entries(FACTOR_WEIGHTS).map(([key, fw]) => {
        const score = breakdown[key] || 0;
        const pct = Math.min(100, (score/fw.max)*100);
        const color = pct>=70?"#4ECDC4":pct>=40?"#FFD93D":"#FF6B35";
        return (
          <div key={key}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <div style={{ fontSize:13, fontWeight:600 }}>{fw.icon} {fw.label}</div>
              <div style={{ fontSize:13, fontWeight:800, color }}>{score}/{fw.max}</div>
            </div>
            <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3 }}>
              <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:3, transition:"width 1s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}