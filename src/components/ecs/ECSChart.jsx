import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
export default function ECSChart({ history=[], height=200 }) {
  if (!history.length) return <div style={{ height, display:"flex", alignItems:"center", justifyContent:"center", color:"#555", fontSize:13 }}>No score history yet</div>;
  const data = history.map(h => ({ date: new Date(h.recorded_at).toLocaleDateString("en-ZA",{month:"short",day:"numeric"}), score: h.score }));
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active||!payload?.length) return null;
    return <div style={{ background:"#1A1A2E", border:"1px solid rgba(255,107,53,0.3)", borderRadius:8, padding:"8px 12px" }}><div style={{ fontSize:10, color:"#888" }}>{label}</div><div style={{ fontSize:15, fontWeight:800, color:"#FF6B35" }}>{payload[0].value}</div></div>;
  };
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top:5, right:5, left:-20, bottom:5 }}>
        <defs>
          <linearGradient id="ecsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fontSize:10, fill:"#555", fontFamily:"DM Mono" }} />
        <YAxis domain={[0,850]} tick={{ fontSize:10, fill:"#555" }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="score" stroke="#FF6B35" strokeWidth={2} fill="url(#ecsGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}