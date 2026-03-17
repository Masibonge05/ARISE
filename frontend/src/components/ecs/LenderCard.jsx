import { formatZAR } from "../../utils/formatters";
export default function LenderCard({ lender, userScore=0 }) {
  const eligible = userScore >= (lender.min_ecs||0);
  return (
    <div style={{ background:eligible?"rgba(78,205,196,0.04)":"rgba(255,255,255,0.02)", border:`1px solid ${eligible?"rgba(78,205,196,0.2)":"rgba(255,255,255,0.07)"}`, borderRadius:12, padding:"14px 16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ fontWeight:700, fontSize:14 }}>{lender.name}</div>
        {eligible ? <span style={{ fontSize:9, background:"rgba(78,205,196,0.1)", border:"1px solid rgba(78,205,196,0.2)", borderRadius:10, padding:"2px 8px", color:"#4ECDC4", fontWeight:700 }}>✓ ELIGIBLE</span> : <span style={{ fontSize:9, color:"#555", fontFamily:"DM Mono,monospace" }}>Min ECS: {lender.min_ecs}</span>}
      </div>
      <div style={{ fontSize:12, color:"#888", marginBottom:6 }}>{lender.product_type} · {lender.institution_type}</div>
      <div style={{ display:"flex", gap:16 }}>
        {[{l:"Max Loan",v:formatZAR(lender.max_loan_amount)},{l:"Rate",v:lender.interest_rate_pct?`${lender.interest_rate_pct}% p.a.`:"—"},{l:"Term",v:lender.max_term_months?`${lender.max_term_months} months`:"Flexible"}].map(m=>(
          <div key={m.l}><div style={{ fontSize:13, fontWeight:700 }}>{m.v}</div><div style={{ fontSize:9, color:"#555", fontFamily:"DM Mono,monospace" }}>{m.l.toUpperCase()}</div></div>
        ))}
      </div>
    </div>
  );
}