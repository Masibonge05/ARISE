import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner, EmptyState } from "../../components/ui";
import api from "../../services/api";

const MOCK_THREADS = [
  { id:"t1", name:"Tech4Africa HR", avatar:"T", type:"employer", verified:true,  unread:1, lastMessage:"We'd love to schedule an interview...", lastAt:"2h ago" },
  { id:"t2", name:"Thandi Mokoena", avatar:"T", type:"mentor",   verified:true,  unread:0, lastMessage:"Here are your action items from today...", lastAt:"Yesterday" },
  { id:"t3", name:"FreshMart SA",   avatar:"F", type:"client",   verified:true,  unread:2, lastMessage:"The logo looks great! Can you also do the letterhead?", lastAt:"2d ago" },
];
const MOCK_MSGS = {
  t1:[
    {id:1,from:"them",text:"Hi! We reviewed your TrustID profile and were really impressed by your verified Figma skills.",ts:"10:00"},
    {id:2,from:"them",text:"We'd love to schedule an interview for the Junior UI/UX Designer role. Are you available this week?",ts:"10:01"},
    {id:3,from:"me",text:"Thank you! I'd love the opportunity. I'm available Thursday or Friday afternoon.",ts:"10:45"},
  ],
  t2:[
    {id:1,from:"them",text:"Great session today! Action items:\n\n1. Apply to NYDA Youth Fund\n2. Register on CIPC via LaunchPad\n3. Draft pitch deck",ts:"15:02"},
    {id:2,from:"me",text:"Thank you Thandi, so helpful! Updates next week.",ts:"15:20"},
  ],
  t3:[
    {id:1,from:"them",text:"The logo looks great!",ts:"09:00"},
    {id:2,from:"them",text:"Can you also do a letterhead and business card? Same budget range.",ts:"09:01"},
    {id:3,from:"me",text:"Absolutely! 2 extra days.",ts:"09:30"},
    {id:4,from:"them",text:"Perfect, let's do it.",ts:"09:35"},
  ],
};
const TYPE_COLORS = {employer:"#FF6B35",mentor:"#4ECDC4",client:"#FFD93D",freelancer:"#A8E6CF"};

export default function Messages() {
  const { threadId }   = useParams();
  const [sp]           = useSearchParams();
  const [threads, setThreads] = useState([]);
  const [active, setActive]   = useState(threadId || sp.get("to") || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [safetyWarn, setSafetyWarn] = useState(null);
  const bottomRef = useRef();

  useEffect(() => {
    api.get("/messages/").then(r => setThreads(r.data.threads?.length ? r.data.threads : MOCK_THREADS)).catch(() => setThreads(MOCK_THREADS)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!active) return;
    api.get(`/messages/${active}`).then(r => setMessages(r.data.messages?.length ? r.data.messages : MOCK_MSGS[active] || [])).catch(() => setMessages(MOCK_MSGS[active] || []));
    setThreads(ts => ts.map(t => t.id === active ? {...t, unread:0} : t));
    setTimeout(() => bottomRef.current?.scrollIntoView({behavior:"smooth"}), 100);
  }, [active]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !active || sending) return;
    const UNSAFE = ["pay upfront","western union","outside arise","my personal number"];
    const warn = UNSAFE.find(w => input.toLowerCase().includes(w));
    if (warn) setSafetyWarn(`Safety tip: Avoid "${warn}" outside ARISE.`);
    const msg = {id:Date.now(), from:"me", text:input.trim(), ts:new Date().toLocaleTimeString("en-ZA",{hour:"2-digit",minute:"2-digit"})};
    setMessages(m => [...m, msg]); setInput(""); setSending(true);
    setTimeout(() => bottomRef.current?.scrollIntoView({behavior:"smooth"}), 50);
    try { await api.post("/messages/", {recipient_id:active, text:msg.text, thread_id:active}); } catch {}
    finally { setSending(false); }
  }, [input, active, sending]);

  const aThread = threads.find(t => t.id === active);
  const totalUnread = threads.reduce((s,t) => s+(t.unread||0), 0);

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box} .thr:hover{background:rgba(255,255,255,0.04)!important;cursor:pointer}`}</style>
      <div style={S.layout}>
        {/* Thread list */}
        <div style={S.threadList}>
          <div style={{padding:"14px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{fontWeight:800,fontSize:15}}>Messages</div>
            {totalUnread > 0 && <div style={{fontSize:10,color:"#FF6B35",fontFamily:"DM Mono,monospace"}}>{totalUnread} unread</div>}
          </div>
          {loading ? <div style={{display:"flex",justifyContent:"center",padding:24}}><Spinner /></div> :
            threads.map(t => {
              const tc = TYPE_COLORS[t.type]||"#888";
              return (
                <div key={t.id} className="thr" onClick={() => setActive(t.id)}
                  style={{padding:"11px 13px", background:active===t.id?"rgba(255,107,53,0.07)":"transparent", borderLeft:`3px solid ${active===t.id?"#FF6B35":"transparent"}`, borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"all 0.15s"}}>
                  <div style={{display:"flex",gap:9}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${tc},${tc}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0}}>{t.avatar}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{fontWeight:700,fontSize:13}}>{t.name}</span>
                        <span style={{fontSize:10,color:"#555",fontFamily:"DM Mono,monospace"}}>{t.lastAt}</span>
                      </div>
                      <div style={{fontSize:11,color:"#666",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:2}}>{t.lastMessage}</div>
                      <div style={{display:"flex",gap:6,marginTop:3,alignItems:"center"}}>
                        <span style={{fontSize:9,color:tc,fontFamily:"DM Mono,monospace"}}>{t.type?.toUpperCase()}</span>
                        {t.verified && <span style={{fontSize:9,color:"#4ECDC4"}}>✓</span>}
                        {(t.unread||0)>0 && <span style={{marginLeft:"auto",background:"#FF6B35",color:"#fff",borderRadius:"50%",width:15,height:15,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800}}>{t.unread}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>

        {/* Chat pane */}
        {active && aThread ? (
          <div style={S.chatPane}>
            <div style={{padding:"13px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${TYPE_COLORS[aThread.type]||"#888"},${TYPE_COLORS[aThread.type]||"#888"}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff"}}>{aThread.avatar}</div>
                <div><div style={{fontWeight:700,fontSize:14}}>{aThread.name}</div><div style={{fontSize:10,color:"#4ECDC4",fontFamily:"DM Mono,monospace"}}>✓ {aThread.type} · Verified</div></div>
              </div>
              <div style={{fontSize:10,color:"#555",fontFamily:"DM Mono,monospace"}}>🔒 Secure channel</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",padding:"7px 18px",background:"rgba(78,205,196,0.04)",borderBottom:"1px solid rgba(78,205,196,0.1)",flexShrink:0}}>
              <span style={{fontSize:13}}>🛡️</span><span style={{fontSize:11,color:"#888"}}>Never share banking details or pay outside ARISE. Contact info shared only with mutual consent.</span>
            </div>
            {safetyWarn && (
              <div style={{padding:"7px 18px",background:"rgba(255,215,61,0.08)",borderBottom:"1px solid rgba(255,215,61,0.2)",display:"flex",justifyContent:"space-between",flexShrink:0}}>
                <span style={{fontSize:11,color:"#FFD93D"}}>⚠ {safetyWarn}</span>
                <button onClick={() => setSafetyWarn(null)} style={{background:"none",border:"none",color:"#FFD93D",cursor:"pointer",fontSize:13}}>×</button>
              </div>
            )}
            <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
              {messages.length === 0 ? <EmptyState icon="💬" title="No messages yet" desc="Start the conversation." /> :
                messages.map(m => (
                  <div key={m.id} style={{display:"flex",justifyContent:m.from==="me"?"flex-end":"flex-start",marginBottom:9}}>
                    <div style={{maxWidth:"70%",background:m.from==="me"?"#FF6B35":"rgba(255,255,255,0.07)",borderRadius:m.from==="me"?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"9px 13px"}}>
                      <div style={{fontSize:13,lineHeight:1.6,color:m.from==="me"?"#fff":"#E8E8F0",whiteSpace:"pre-wrap"}}>{m.text}</div>
                      <div style={{fontSize:10,color:m.from==="me"?"rgba(255,255,255,0.55)":"#555",marginTop:3,textAlign:"right",fontFamily:"DM Mono,monospace"}}>{m.ts}</div>
                    </div>
                  </div>
                ))
              }
              <div ref={bottomRef} />
            </div>
            <div style={{padding:"13px 18px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:10,flexShrink:0}}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => {if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}}
                placeholder="Type a message… (Enter to send)"
                style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"11px 14px",color:"#E8E8F0",fontFamily:"Sora,sans-serif",fontSize:13,outline:"none"}} />
              <button onClick={sendMessage} disabled={!input.trim()||sending}
                style={{background:"#FF6B35",color:"#fff",border:"none",borderRadius:8,padding:"11px 18px",fontSize:16,cursor:"pointer",opacity:(!input.trim()||sending)?0.5:1}}>
                {sending ? <Spinner size={16} color="#fff" /> : "→"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{...S.chatPane,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <EmptyState icon="💬" title="Select a conversation" desc="Choose a thread to start messaging." />
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  page: {fontFamily:"'Sora',sans-serif",background:"#0A0A0F",color:"#E8E8F0",height:"calc(100vh - 60px)",display:"flex",flexDirection:"column"},
  layout: {display:"flex",flex:1,overflow:"hidden",margin:"16px",gap:0,borderRadius:14,border:"1px solid rgba(255,255,255,0.07)",overflow:"hidden"},
  threadList: {width:272,background:"rgba(255,255,255,0.02)",borderRight:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"},
  chatPane: {flex:1,display:"flex",flexDirection:"column",overflow:"hidden"},
};