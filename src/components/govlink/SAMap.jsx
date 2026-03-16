// SA Province Bubble Map - renders province data as positioned bubbles
// Full SVG map rendering is done in GovLinkMap.jsx
const PROVINCE_POSITIONS = {
  "Gauteng":       { x:"50%", y:"52%" }, "Western Cape":  { x:"22%", y:"82%" },
  "KwaZulu-Natal": { x:"70%", y:"60%" }, "Eastern Cape":  { x:"52%", y:"75%" },
  "Limpopo":       { x:"55%", y:"28%" }, "Mpumalanga":    { x:"65%", y:"42%" },
  "North West":    { x:"38%", y:"42%" }, "Free State":    { x:"47%", y:"62%" },
  "Northern Cape": { x:"28%", y:"55%" },
};

export default function SAMap({ data={}, metric="registrations", onProvinceClick=null }) {
  const values = Object.values(data);
  const maxVal = Math.max(...values, 1);
  return (
    <div style={{ position:"relative", width:"100%", paddingTop:"70%", background:"rgba(255,255,255,0.02)", borderRadius:12, overflow:"hidden" }}>
      {/* Background SA outline hint */}
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"rgba(255,255,255,0.04)", fontFamily:"DM Mono,monospace" }}>SOUTH AFRICA</div>
      {Object.entries(PROVINCE_POSITIONS).map(([prov, pos]) => {
        const val = data[prov] || 0;
        const r = 12 + (val/maxVal)*40;
        const color = val >= maxVal*0.7 ? "#FF6B35" : val >= maxVal*0.4 ? "#FFD93D" : "#4ECDC4";
        return (
          <div key={prov} onClick={()=>onProvinceClick?.(prov)}
            title={`${prov}: ${val}`}
            style={{ position:"absolute", left:pos.x, top:pos.y, transform:"translate(-50%,-50%)", width:r*2, height:r*2, borderRadius:"50%", background:`${color}30`, border:`2px solid ${color}60`, display:"flex", alignItems:"center", justifyContent:"center", cursor:onProvinceClick?"pointer":"default", transition:"all 0.3s" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:11, fontWeight:800, color }}>{val>=1000?`${(val/1000).toFixed(1)}k`:val}</div>
              <div style={{ fontSize:7, color:"#888", fontFamily:"DM Mono,monospace", whiteSpace:"nowrap" }}>{prov.split(" ")[0].toUpperCase()}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}