import { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../hooks/useToast";
export default function AvailabilityToggle({ initial=true }) {
  const toast = useToast();
  const [available, setAvailable] = useState(initial);
  const [saving, setSaving] = useState(false);
  const toggle = async () => {
    setSaving(true);
    try {
      await api.patch("/users/me", { is_available_for_freelance: !available });
      setAvailable(v => !v);
      toast.success(available ? "You are now offline for new projects" : "You are now available for projects!");
    } catch { toast.error("Could not update availability"); }
    finally { setSaving(false); }
  };
  return (
    <button onClick={toggle} disabled={saving}
      style={{ display:"flex", alignItems:"center", gap:8, background:available?"rgba(78,205,196,0.12)":"rgba(255,255,255,0.05)", border:`1px solid ${available?"rgba(78,205,196,0.3)":"rgba(255,255,255,0.1)"}`, color:available?"#4ECDC4":"#888", borderRadius:20, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:available?"#4ECDC4":"#555" }} />
      {saving ? "Updating…" : available ? "Available" : "Unavailable"}
    </button>
  );
}