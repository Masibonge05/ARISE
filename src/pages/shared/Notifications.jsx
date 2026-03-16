import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const TYPE_CONFIG = {
  application_update:  { icon:"📋", color:"#FF6B35" },
  ecs_change:          { icon:"⭐", color:"#FFD93D" },
  investor_interest:   { icon:"📈", color:"#FFD93D" },
  verification_update: { icon:"✅", color:"#4ECDC4" },
  new_match:           { icon:"💼", color:"#FF6B35" },
  message:             { icon:"💬", color:"#4ECDC4" },
  session_booked:      { icon:"🤝", color:"#4ECDC4" },
  escrow_released:     { icon:"💰", color:"#4ECDC4" },
  safety_alert:        { icon:"🛡️", color:"#FF6B35" },
  system:              { icon:"⚡", color:"#888" },
};

const MOCK = [
  { id:"n1", type:"application_update", title:"Application Shortlisted! 🎉",     body:"Tech4Africa shortlisted you for Junior UI/UX Designer — you're in the top 5!",                    is_read:false, action_url:"/applications",  created_at: new Date(Date.now()-7200000).toISOString() },
  { id:"n2", type:"ecs_change",         title:"ECS Score +25",                   body:"You completed your mentor session with Thandi Mokoena. Your score is now 365.",                   is_read:false, action_url:"/ecs",           created_at: new Date(Date.now()-18000000).toISOString() },
  { id:"n3", type:"investor_interest",  title:"Investor Expressed Interest",     body:"A verified angel investor from Cape Angel Network has expressed interest in your business.",       is_read:false, action_url:"/investors",     created_at: new Date(Date.now()-86400000).toISOString() },
  { id:"n4", type:"verification_update",title:"Qualification Verified ✓",        body:"Your BEng Electrical Engineering from University of Johannesburg has been verified.",             is_read:true,  action_url:"/profile",       created_at: new Date(Date.now()-172800000).toISOString() },
  { id:"n5", type:"new_match",          title:"3 New Job Matches",               body:"New jobs matching your TrustID profile are available. Highest match: 94%.",                       is_read:true,  action_url:"/jobs",          created_at: new Date(Date.now()-259200000).toISOString() },
  { id:"n6", type:"escrow_released",    title:"Payment Released — R5,800",       body:"Your payment for 'Logo for FreshMart SA' has been released from escrow to your account.",         is_read:true,  action_url:"/freelance/earnings", created_at: new Date(Date.now()-604800000).toISOString() },
  { id:"n7", type:"safety_alert",       title:"Safety Report Resolved",          body:"A job posting you flagged has been removed after investigation. Thank you for keeping ARISE safe.", is_read:true,  action_url:"/safety",        created_at: new Date(Date.now()-864000000).toISOString() },
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const h = Math.floor(diff/3600000), d = Math.floor(diff/86400000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-ZA",{month:"short",day:"numeric"});
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/users/me/notifications").then(r => setNotifications(r.data.notifications?.length ? r.data.notifications : MOCK)).catch(() => setNotifications(MOCK)).finally(() => setLoading(false));
  }, []);

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, is_read:true })));
  const markRead = id => setNotifications(n => n.map(x => x.id===id ? {...x, is_read:true} : x));

  const unread = notifications.filter(n => !n.is_read).length;
  const filtered = filter === "unread" ? notifications.filter(n => !n.is_read)
    : filter === "all" ? notifications
    : notifications.filter(n => n.type === filter);

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box} .notif:hover{border-color:rgba(255,107,53,0.2)!important;background:rgba(255,107,53,0.03)!important} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={S.inner}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", animation:"fadeUp 0.4s ease forwards" }}>
          <div>
            <h1 style={S.title}>Notifications</h1>
            <p style={{ fontSize:14, color:"#888" }}>{unread > 0 ? `${unread} unread` : "All caught up ✓"}</p>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#888", borderRadius:8, padding:"8px 16px", fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", animation:"fadeUp 0.4s 0.05s ease both" }}>
          {[{k:"all",l:"All"},{k:"unread",l:`Unread (${unread})`},{k:"application_update",l:"Applications"},{k:"ecs_change",l:"ECS"},{k:"investor_interest",l:"Investors"}].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)}
              style={{ background:filter===f.k?"rgba(255,107,53,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${filter===f.k?"rgba(255,107,53,0.35)":"rgba(255,255,255,0.08)"}`, color:filter===f.k?"#FF6B35":"#888", borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:filter===f.k?700:400, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:60, color:"#555" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔔</div>
              <div style={{ fontWeight:700, fontSize:15 }}>No notifications{filter !== "all" ? " in this category" : ""}</div>
            </div>
          ) : filtered.map((n, i) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
            return (
              <Link key={n.id} to={n.action_url || "#"} onClick={() => markRead(n.id)} className="notif"
                style={{ display:"flex", gap:14, padding:16, background:n.is_read?"rgba(255,255,255,0.02)":"rgba(255,107,53,0.04)", border:`1px solid ${n.is_read?"rgba(255,255,255,0.06)":"rgba(255,107,53,0.15)"}`, borderRadius:12, textDecoration:"none", transition:"all 0.15s", animation:`fadeUp 0.4s ${i*0.04}s ease both` }}>
                <div style={{ width:42, height:42, borderRadius:"50%", background:`${cfg.color}15`, border:`1px solid ${cfg.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{cfg.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom:4 }}>
                    <div style={{ fontWeight:n.is_read?600:800, fontSize:14, color:"#E8E8F0" }}>{n.title}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                      {!n.is_read && <div style={{ width:7, height:7, borderRadius:"50%", background:"#FF6B35", flexShrink:0 }} />}
                      <span style={{ fontSize:11, color:"#555", fontFamily:"DM Mono,monospace" }}>{timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:13, color:"#888", lineHeight:1.5 }}>{n.body}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { fontFamily:"'Sora',sans-serif", background:"#0A0A0F", color:"#E8E8F0", minHeight:"100vh", padding:"32px 24px" },
  inner: { maxWidth:720, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 },
  title: { fontSize:"clamp(22px,3vw,30px)", fontWeight:800, marginBottom:4 },
};