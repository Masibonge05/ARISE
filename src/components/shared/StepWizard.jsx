export default function StepWizard({ steps=[], currentStep=0, onStepClick=null }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, padding:"0 16px" }}>
      {steps.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        const color = done ? "#4ECDC4" : active ? "#FF6B35" : "rgba(255,255,255,0.15)";
        return (
          <div key={i} style={{ display:"flex", alignItems:"center" }}>
            <div onClick={() => onStepClick?.(i)}
              style={{ width:32, height:32, borderRadius:"50%", background:done?"#4ECDC4":active?"rgba(255,107,53,0.2)":"rgba(255,255,255,0.05)", border:`2px solid ${color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:done?"#0A0A0F":active?"#FF6B35":"#555", cursor:onStepClick?"pointer":"default", flexShrink:0 }}>
              {done ? "✓" : i+1}
            </div>
            {step.label && active && <div style={{ marginLeft:8, fontSize:12, fontWeight:700, color:"#FF6B35", whiteSpace:"nowrap" }}>{step.label}</div>}
            {i < steps.length-1 && <div style={{ width:40, height:2, background:done?"#4ECDC4":"rgba(255,255,255,0.08)", margin:"0 4px" }} />}
          </div>
        );
      })}
    </div>
  );
}