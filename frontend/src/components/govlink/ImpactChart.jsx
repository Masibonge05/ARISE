import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
export default function ImpactChart({ data=[], dataKey="value", type="area", color="#FF6B35", height=200 }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active||!payload?.length) return null;
    return <div style={{ background:"#1A1A2E", border:`1px solid ${color}40`, borderRadius:8, padding:"8px 12px" }}><div style={{ fontSize:10, color:"#888" }}>{label}</div><div style={{ fontSize:14, fontWeight:800, color }}>{payload[0].value?.toLocaleString()}</div></div>;
  };
  if (type === "bar") return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top:5, right:5, left:-20, bottom:5 }}>
        <XAxis dataKey="label" tick={{ fontSize:9, fill:"#555", fontFamily:"DM Mono" }} />
        <YAxis tick={{ fontSize:9, fill:"#555" }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={dataKey} fill={color} radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top:5, right:5, left:-20, bottom:5 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={{ fontSize:9, fill:"#555", fontFamily:"DM Mono" }} />
        <YAxis tick={{ fontSize:9, fill:"#555" }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#grad-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}