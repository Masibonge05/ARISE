import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
import { EmptyState, Spinner, ErrorBanner, SectionLabel } from "../../components/ui";
import api from "../../services/api";

const CATEGORIES = ["design","development","writing","photography","translation","marketing","video","crafts","tutoring","other"];
const PAYMENT_METHODS = ["SnapScan","Yoco","EFT","Cash"];

function ListingCard({ listing, isOwn, onEdit, onDelete }) {
  const [inquiring, setInquiring] = useState(false);
  const toast = useToast();

  const handleInquire = async () => {
    setInquiring(true);
    try {
      await api.post(`/marketboost/listings/${listing.id}/inquire`);
      toast.success("Inquiry sent via ARISE messages!");
    } catch { toast.error("Could not send inquiry."); }
    finally { setInquiring(false); }
  };

  return (
    <div style={S.card}>
      {/* Category badge */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <span style={{ fontSize:10, background:"rgba(78,205,196,0.1)", border:"1px solid rgba(78,205,196,0.2)", borderRadius:12, padding:"2px 8px", color:"#4ECDC4", fontWeight:700, fontFamily:"DM Mono,monospace", textTransform:"uppercase" }}>{listing.category}</span>
        {listing.is_service && <span style={{ fontSize:10, color:"#666" }}>🛎 Service</span>}
      </div>

      <div style={{ fontWeight:700, fontSize:15, marginBottom:5 }}>{listing.title}</div>
      <div style={{ fontSize:12, color:"#888", marginBottom:10, lineHeight:1.5 }}>{listing.description?.slice(0,90)}{listing.description?.length > 90 ? "…" : ""}</div>

      {/* Seller info */}
      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:12 }}>
        <div style={{ width:24, height:24, borderRadius:"50%", background:"linear-gradient(135deg,#FF6B35,#FF3D00)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#fff" }}>
          {listing.seller_name?.[0] || "S"}
        </div>
        <span style={{ fontSize:12, color:"#666" }}>{listing.seller_name}</span>
        {listing.seller_ecs_score > 0 && <span style={{ fontSize:10, color:"#FF6B35", fontFamily:"DM Mono,monospace" }}>ECS {listing.seller_ecs_score}</span>}
      </div>

      {/* Price + payment */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, color:"#FFD93D" }}>R{listing.price?.toLocaleString()}</div>
          <div style={{ fontSize:10, color:"#555", fontFamily:"DM Mono,monospace" }}>{listing.currency || "ZAR"}</div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {isOwn ? (
            <>
              <button onClick={() => onEdit(listing)} style={S.editBtn}>Edit</button>
              <button onClick={() => onDelete(listing.id)} style={S.deleteBtn}>×</button>
            </>
          ) : (
            <>
              <a href={listing.whatsapp_link} target="_blank" rel="noreferrer"
                style={{ background:"rgba(78,205,196,0.1)", border:"1px solid rgba(78,205,196,0.2)", color:"#4ECDC4", borderRadius:8, padding:"8px 12px", fontSize:11, fontWeight:700, textDecoration:"none" }}>
                💬 WhatsApp
              </a>
              <button onClick={handleInquire} disabled={inquiring}
                style={{ background:"#FF6B35", color:"#fff", border:"none", borderRadius:8, padding:"8px 12px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                {inquiring ? <Spinner size={12} color="#fff" /> : "Inquire →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MarketBoost() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("browse"); // browse | mine
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title:"", description:"", price:"", category:"design", is_service:true });
  const setF = (k,v) => setForm(f => ({...f, [k]:v}));

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [browse, mine] = await Promise.all([
          api.get("/marketboost/browse"),
          api.get("/marketboost/storefront/mine"),
        ]);
        setListings(browse.data.listings || MOCK_LISTINGS);
        setMyListings(mine.data.listings || []);
      } catch { setListings(MOCK_LISTINGS); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const handleSave = async () => {
    if (!form.title || !form.price) { toast.error("Title and price are required."); return; }
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/marketboost/listings/${editingId}`, { title:form.title, description:form.description, price:parseFloat(form.price) });
        setMyListings(l => l.map(x => x.id===editingId ? {...x,...form, price:parseFloat(form.price)} : x));
        toast.success("Listing updated!");
      } else {
        const res = await api.post("/marketboost/listings", {...form, price:parseFloat(form.price)});
        const newL = { id:res.data.listing_id || Date.now().toString(), seller_name:user?.full_name, seller_ecs_score:user?.ecs_score||0, ...form, price:parseFloat(form.price), is_active:true, whatsapp_link:"#" };
        setMyListings(l => [newL, ...l]);
        toast.success("Listing live on MarketBoost! 🎉");
      }
      setShowForm(false); setEditingId(null);
      setForm({ title:"", description:"", price:"", category:"design", is_service:true });
    } catch { toast.error("Could not save listing."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/marketboost/listings/${id}`);
      setMyListings(l => l.filter(x => x.id !== id));
      toast.success("Listing removed.");
    } catch { toast.error("Could not delete listing."); }
  };

  const handleEdit = (listing) => {
    setForm({ title:listing.title, description:listing.description||"", price:String(listing.price), category:listing.category, is_service:listing.is_service });
    setEditingId(listing.id);
    setShowForm(true);
  };

  const filtered = tab === "mine" ? myListings
    : filter === "all" ? listings
    : listings.filter(l => l.category === filter);

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box} .mb-card:hover{border-color:rgba(78,205,196,0.3)!important;transform:translateY(-2px)} .inp{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:11px 14px;color:#E8E8F0;font-family:Sora,sans-serif;font-size:14px;outline:none} .inp:focus{border-color:#4ECDC4} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={S.inner}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, animation:"fadeUp 0.4s ease forwards" }}>
          <div>
            <h1 style={S.title}>MarketBoost</h1>
            <p style={{ fontSize:14, color:"#888" }}>Sell your skills & services. Share via WhatsApp. Get paid.</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ title:"", description:"", price:"", category:"design", is_service:true }); }}
            style={S.primaryBtn}>+ Create Listing</button>
        </div>

        {/* Info banner */}
        <div style={{ background:"rgba(78,205,196,0.05)", border:"1px solid rgba(78,205,196,0.15)", borderRadius:10, padding:"12px 16px", display:"flex", gap:10, animation:"fadeUp 0.4s 0.05s ease both" }}>
          <span>🌐</span>
          <span style={{ fontSize:13, color:"#AAA" }}>Each listing auto-generates a <strong style={{ color:"#4ECDC4" }}>WhatsApp share link</strong>. Share your storefront on social media to attract clients from outside ARISE.</span>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:0, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:4, width:"fit-content", animation:"fadeUp 0.4s 0.05s ease both" }}>
          {[{k:"browse",l:"Browse Marketplace"},{k:"mine",l:`My Listings (${myListings.length})`}].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ background:tab===t.k?"rgba(78,205,196,0.15)":"transparent", border:`1px solid ${tab===t.k?"rgba(78,205,196,0.35)":"transparent"}`, color:tab===t.k?"#4ECDC4":"#888", borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:tab===t.k?700:500, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
              {t.l}
            </button>
          ))}
        </div>

        {/* Category filters (browse only) */}
        {tab === "browse" && (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", animation:"fadeUp 0.4s 0.1s ease both" }}>
            {["all",...CATEGORIES].map(c => (
              <button key={c} onClick={() => setFilter(c)}
                style={{ background:filter===c?"rgba(255,107,53,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${filter===c?"rgba(255,107,53,0.35)":"rgba(255,255,255,0.08)"}`, color:filter===c?"#FF6B35":"#888", borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:filter===c?700:400, cursor:"pointer", fontFamily:"Sora,sans-serif", textTransform:"capitalize" }}>
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Listings */}
        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:48 }}><Spinner size={32} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🛍️" title={tab==="mine"?"No listings yet":"No listings in this category"}
            desc={tab==="mine"?"Create your first listing to start selling.":"Be the first to list in this category!"}
            action={<button onClick={() => setShowForm(true)} style={S.primaryBtn}>Create a Listing →</button>} />
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
            {filtered.map((l, i) => (
              <div key={l.id} className="mb-card" style={{ transition:"all 0.2s", animation:`fadeUp 0.4s ${i*0.04}s ease both` }}>
                <ListingCard listing={l} isOwn={l.seller_id === user?.id || tab==="mine"} onEdit={handleEdit} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div style={S.overlay} onClick={() => setShowForm(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>{editingId ? "Edit Listing" : "Create a Listing"}</h3>
            <p style={{ fontSize:12, color:"#666", marginBottom:20 }}>Powered by ARISE MarketBoost · WhatsApp share link auto-generated</p>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div><label style={S.label}>Title *</label><input className="inp" placeholder="e.g. Logo design for your business" value={form.title} onChange={e => setF("title",e.target.value)} /></div>
              <div><label style={S.label}>Description</label><textarea className="inp" rows={3} style={{ resize:"vertical" }} placeholder="Describe your service or product…" value={form.description} onChange={e => setF("description",e.target.value)} /></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div><label style={S.label}>Price (ZAR) *</label><input className="inp" type="number" placeholder="500" value={form.price} onChange={e => setF("price",e.target.value)} /></div>
                <div><label style={S.label}>Category</label>
                  <select className="inp" value={form.category} onChange={e => setF("category",e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", fontSize:13, color:"#AAA" }}>
                <input type="checkbox" checked={form.is_service} onChange={e => setF("is_service",e.target.checked)} style={{ accentColor:"#4ECDC4" }} />
                This is a service (not a physical product)
              </label>
              <button onClick={handleSave} disabled={saving || !form.title || !form.price}
                style={{ background:"#4ECDC4", color:"#0A0A0F", border:"none", padding:"13px", borderRadius:8, fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"Sora,sans-serif", opacity:(!form.title||!form.price||saving)?0.5:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {saving ? <Spinner size={16} color="#0A0A0F" /> : null}
                {saving ? "Saving…" : editingId ? "Update Listing" : "Publish Listing →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const MOCK_LISTINGS = [
  { id:"l1", title:"Logo & Brand Identity Design",   description:"Professional logo design with brand guidelines. 3 concepts, unlimited revisions.", category:"design",      seller_name:"Sipho Nkosi",   seller_ecs_score:680, price:3500, is_service:true,  whatsapp_link:"https://wa.me/?text=Logo%20design%20enquiry", seller_id:"other1" },
  { id:"l2", title:"English to isiZulu Translation", description:"Accurate, natural translation for business documents, websites, and marketing materials.", category:"translation", seller_name:"Thandi Dube",   seller_ecs_score:520, price:800,  is_service:true,  whatsapp_link:"https://wa.me/?text=Translation%20enquiry",  seller_id:"other2" },
  { id:"l3", title:"React Web Development",          description:"Build responsive web applications using React and modern JavaScript. Portfolio available.", category:"development",seller_name:"Lebo Mokoena", seller_ecs_score:710, price:8000, is_service:true,  whatsapp_link:"https://wa.me/?text=Dev%20enquiry",           seller_id:"other3" },
  { id:"l4", title:"Professional Photography",       description:"Product, event, and portrait photography in Johannesburg. Editing included.", category:"photography", seller_name:"Amara Diallo",  seller_ecs_score:450, price:2500, is_service:true,  whatsapp_link:"https://wa.me/?text=Photography%20enquiry",   seller_id:"other4" },
];

const S = {
  page: { fontFamily:"'Sora',sans-serif", background:"#0A0A0F", color:"#E8E8F0", minHeight:"100vh", padding:"32px 24px" },
  inner: { maxWidth:1100, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 },
  title: { fontSize:"clamp(22px,3vw,30px)", fontWeight:800, marginBottom:4 },
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:20 },
  label: { display:"block", fontSize:12, color:"#888", marginBottom:6, fontWeight:600 },
  primaryBtn: { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, background:"#4ECDC4", color:"#0A0A0F", border:"none", padding:"10px 20px", borderRadius:8, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"Sora,sans-serif" },
  editBtn: { background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#888", borderRadius:7, padding:"7px 12px", fontSize:11, cursor:"pointer", fontFamily:"Sora,sans-serif" },
  deleteBtn: { background:"rgba(255,68,68,0.1)", border:"1px solid rgba(255,68,68,0.2)", color:"#FF6666", borderRadius:7, padding:"7px 10px", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif" },
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 },
  modal: { background:"#141420", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:28, maxWidth:460, width:"90%", maxHeight:"90vh", overflowY:"auto" },
};