import { formatZAR } from "../../utils/formatters";
export default function EscrowStatus({ amount, status="held", releaseDate=null }) {
  const configs = {
    held:      { color:"#FFD93D", icon:"🔒", label:"In Escrow",  desc:"Held safely until delivery is confirmed" },
    released:  { color:"#4ECDC4", icon:"✅", label:"Released",   desc:"Payment has been released to your account" },
    disputed:  { color:"#FF6B35", icon:"⚠️", label:"Disputed",   desc:"Under review by ARISE team" },
    refunded:  { color:"#888",    icon:"↩️", label:"Refunded",   desc:"Payment returned to client" },
  };
  const c = configs[status] || configs.held;
  return (
    <div style={{ background:`${c.color}08`, border:`1px solid ${c.color}25`, borderRadius:12, padding:"14px 16px", display:"flex", gap:12, alignItems:"center" }}>
      <span style={{ fontSize:22 }}>{c.icon}</span>
      <div>
        <div style={{ fontWeight:700, color:c.color, fontSize:13 }}>{c.label}</div>
        <div style={{ fontSize:16, fontWeight:900, color:"#E8E8F0" }}>{formatZAR(amount)}</div>
        <div style={{ fontSize:11, color:"#888" }}>{c.desc}</div>
      </div>
    </div>
  );
}