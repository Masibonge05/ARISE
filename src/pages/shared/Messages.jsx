import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const MOCK_THREADS = [
  { id: "t1", name: "Tech4Africa HR", avatar: "T", lastMessage: "We'd love to schedule an interview...", time: "2h ago", unread: 1, type: "employer", verified: true },
  { id: "t2", name: "Thandi Mokoena", avatar: "T", lastMessage: "Great session today! Here are the action items...", time: "Yesterday", unread: 0, type: "mentor", verified: true },
  { id: "t3", name: "Sipho Dlamini", avatar: "S", lastMessage: "I've reviewed your brief and can deliver in 5 days", time: "2d ago", unread: 2, type: "freelancer", verified: true },
];

const MOCK_MESSAGES = {
  t1: [
    { id: 1, from: "them", text: "Hi! We reviewed your TrustID profile and were really impressed by your verified Figma skills.", time: "10:00" },
    { id: 2, from: "them", text: "We'd love to schedule an interview for the Junior UI/UX Designer role. Are you available this week?", time: "10:01" },
    { id: 3, from: "me", text: "Thank you so much! I'd love the opportunity. I'm available Thursday or Friday afternoon.", time: "10:45" },
  ],
  t2: [
    { id: 1, from: "them", text: "Great session today! I'm going to send you a summary of what we discussed.", time: "15:00" },
    { id: 2, from: "them", text: "Action items: 1) Register on CIPC 2) Apply to NYDA grant 3) Draft your pitch deck", time: "15:02" },
    { id: 3, from: "me", text: "Thank you Thandi, this was so helpful. I'll have updates by next week.", time: "15:20" },
  ],
  t3: [],
};

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeThread, setActiveThread] = useState(searchParams.get("to") || "t1");
  const [messages, setMessages] = useState(MOCK_MESSAGES[activeThread] || []);
  const [input, setInput] = useState("");
  const bottomRef = useRef();

  useEffect(() => {
    setMessages(MOCK_MESSAGES[activeThread] || []);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [activeThread]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), from: "me", text: input, time: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }) };
    setMessages((m) => [...m, newMsg]);
    setInput("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const activeThreadData = MOCK_THREADS.find((t) => t.id === activeThread);

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; }`}</style>
      <div style={styles.layout}>
        {/* Thread list */}
        <div style={styles.threadList}>
          <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>Messages</h2>
            <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace", marginTop: 4 }}>All communication is secure & logged</div>
          </div>
          {MOCK_THREADS.map((t) => (
            <div key={t.id} onClick={() => setActiveThread(t.id)} style={{ padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)", background: activeThread === t.id ? "rgba(255,107,53,0.06)" : "transparent", borderLeft: activeThread === t.id ? "3px solid #FF6B35" : "3px solid transparent", transition: "all 0.15s" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #FF6B35, #FF3D00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{t.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</span>
                    <span style={{ fontSize: 11, color: "#555" }}>{t.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.lastMessage}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: "#4ECDC4", fontFamily: "DM Mono, monospace" }}>{t.type.toUpperCase()}</span>
                    {t.verified && <span style={{ fontSize: 9, color: "#4ECDC4" }}>✓</span>}
                    {t.unread > 0 && <span style={{ marginLeft: "auto", background: "#FF6B35", color: "#fff", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>{t.unread}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div style={styles.chatArea}>
          {/* Chat header */}
          <div style={styles.chatHeader}>
            <div style={{ display: "flex", align: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #FF6B35, #FF3D00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>{activeThreadData?.avatar}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{activeThreadData?.name}</div>
                <div style={{ fontSize: 11, color: "#4ECDC4", fontFamily: "DM Mono, monospace" }}>✓ {activeThreadData?.type} · Verified</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace" }}>🔒 Secure channel</div>
          </div>

          {/* Safety notice */}
          <div style={styles.safetyNote}>
            <span>🛡️</span>
            <span style={{ fontSize: 12, color: "#888" }}>Messages are monitored for safety. Never share personal banking details or pay anyone outside ARISE.</span>
          </div>

          {/* Messages */}
          <div style={styles.messageArea}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", color: "#555", padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                <div style={{ fontSize: 13 }}>No messages yet. Start the conversation.</div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                  <div style={{ maxWidth: "70%", background: m.from === "me" ? "#FF6B35" : "rgba(255,255,255,0.06)", borderRadius: m.from === "me" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "10px 14px" }}>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: m.from === "me" ? "#fff" : "#E8E8F0" }}>{m.text}</div>
                    <div style={{ fontSize: 10, color: m.from === "me" ? "rgba(255,255,255,0.6)" : "#555", marginTop: 4, textAlign: "right" }}>{m.time}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={styles.inputArea}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()} placeholder="Type a message... (Press Enter to send)" style={styles.messageInput} />
            <button onClick={sendMessage} disabled={!input.trim()} style={styles.sendBtn}>→</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", height: "100vh", display: "flex", flexDirection: "column" },
  layout: { display: "flex", flex: 1, overflow: "hidden", maxWidth: 1100, margin: "0 auto", width: "100%", padding: "24px", gap: 0 },
  threadList: { width: 280, background: "rgba(255,255,255,0.02)", borderRadius: "14px 0 0 14px", border: "1px solid rgba(255,255,255,0.07)", borderRight: "none", overflow: "hidden", display: "flex", flexDirection: "column", flexShrink: 0 },
  chatArea: { flex: 1, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", borderRadius: "0 14px 14px 0", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" },
  chatHeader: { padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" },
  safetyNote: { display: "flex", gap: 8, alignItems: "center", padding: "8px 20px", background: "rgba(78,205,196,0.04)", borderBottom: "1px solid rgba(78,205,196,0.1)" },
  messageArea: { flex: 1, overflowY: "auto", padding: "20px" },
  inputArea: { padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10 },
  messageInput: { flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px 16px", color: "#E8E8F0", fontFamily: "Sora, sans-serif", fontSize: 14, outline: "none" },
  sendBtn: { background: "#FF6B35", color: "#fff", border: "none", borderRadius: 8, padding: "12px 20px", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif", transition: "all 0.2s" },
};