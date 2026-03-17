import { formatZAR } from "../../utils/formatters";
export default function RateCard({ hourlyRate, projectRate, currency="ZAR" }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 18px" }}>
      <div style={{ fontSize:11, color:"#555", fontFamily:"DM Mono,monospace", marginBottom:10 }}>RATES</div>
      {hourlyRate && <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:12, color:"#888" }}>Hourly rate</span>
        <span style={{ fontSize:14, fontWeight:700, color:"#FFD93D" }}>{formatZAR(hourlyRate)}/hr</span>
      </div>}
      {projectRate && <div style={{ display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:12, color:"#888" }}>Fixed project rate</span>
        <span style={{ fontSize:14, fontWeight:700, color:"#FFD93D" }}>from {formatZAR(projectRate)}</span>
      </div>}
    </div>
  );
}