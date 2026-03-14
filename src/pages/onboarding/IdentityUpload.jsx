import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const STEPS = ["persona", "identity", "qualifications", "skills", "goals", "complete"];

export default function IdentityUpload() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const fileRef = useRef();

  const [stage, setStage] = useState("upload"); // upload → scanning → extracted → done
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    if (!["image/jpeg", "image/png", "application/pdf"].includes(f.type)) {
      setError("Please upload a JPG, PNG, or PDF file.");
      return;
    }
    setFile(f);
    setError(null);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    setStage("scanning");
    setError(null);

    // Simulate Huawei OCR scanning delay for demo effect
    await new Promise((r) => setTimeout(r, 2500));

    try {
      // TODO: real OCR endpoint
      // const formData = new FormData();
      // formData.append("file", file);
      // const res = await api.post("/trustid/ocr/id", formData);

      // Mock OCR result for demo
      const mockResult = {
        first_name: user?.first_name || "Sphiwe",
        last_name: user?.last_name || "Dlamini",
        id_number: "0205***4085",
        date_of_birth: "2002-05-15",
        gender: "Male",
        nationality: "South African",
        confidence_score: 0.97,
      };

      setExtracted(mockResult);
      setStage("extracted");
    } catch (e) {
      setError("OCR scan failed. Please try a clearer image.");
      setStage("upload");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.patch("/users/me", {
        id_number: extracted?.id_number,
        date_of_birth: extracted?.date_of_birth,
        gender: extracted?.gender?.toLowerCase(),
      });
      await refreshUser();
      setStage("done");
      setTimeout(() => navigate("/onboarding/qualifications"), 1500);
    } catch (e) {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const skipStep = () => navigate("/onboarding/qualifications");

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .drop-zone { border: 2px dashed rgba(255,107,53,0.3); border-radius: 14px; padding: 48px 32px; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(255,107,53,0.03); }
        .drop-zone:hover, .drop-zone.dragging { border-color: #FF6B35; background: rgba(255,107,53,0.06); }
        .arise-btn { background: #FF6B35; color: #fff; border: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Sora', sans-serif; transition: all 0.2s; width: 100%; }
        .arise-btn:hover:not(:disabled) { background: #FF4500; transform: translateY(-1px); }
        .arise-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .arise-btn-ghost { background: transparent; color: #888; border: 1px solid rgba(255,255,255,0.1); padding: 12px 24px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Sora', sans-serif; transition: all 0.2s; }
        .arise-btn-ghost:hover { color: #CCC; border-color: rgba(255,255,255,0.2); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scanLine { 0% { top: 0; } 100% { top: 100%; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes checkPop { 0% { transform: scale(0); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }
      `}</style>

      <div style={styles.inner}>
        {/* Progress */}
        <div style={styles.progressBar}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: i <= 1 ? "#FF6B35" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
              {i < STEPS.length - 1 && <div style={{ width: 32, height: 1, background: i < 1 ? "#FF6B35" : "rgba(255,255,255,0.08)" }} />}
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 520, margin: "0 auto", width: "100%" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeUp 0.4s ease forwards" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🪪</div>
            <h1 style={styles.title}>Verify your identity</h1>
            <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>
              Upload your South African ID book, ID card, or passport.<br />
              <strong style={{ color: "#4ECDC4" }}>Huawei OCR</strong> reads it instantly — no manual typing needed.
            </p>
          </div>

          {/* Upload stage */}
          {stage === "upload" && (
            <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
              <div
                className="drop-zone"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <div>
                    <img src={preview} alt="ID preview" style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 8, marginBottom: 16 }} />
                    <div style={{ fontSize: 13, color: "#4ECDC4" }}>✓ {file?.name}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Drop your ID document here</div>
                    <div style={{ fontSize: 13, color: "#666" }}>or click to browse · JPG, PNG, PDF accepted</div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />

              {error && <div style={styles.errorBanner}>{error}</div>}

              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <button className="arise-btn" onClick={handleScan} disabled={!file}>
                  {file ? "Scan with Huawei OCR →" : "Upload a document first"}
                </button>
                <button className="arise-btn-ghost" onClick={skipStep}>Skip for now — I'll verify later</button>
              </div>

              <div style={styles.securityNote}>
                <span style={{ fontSize: 16 }}>🔒</span>
                <span style={{ fontSize: 12, color: "#666" }}>
                  Your document is encrypted with <strong style={{ color: "#888" }}>Huawei DEW</strong> and stored securely in <strong style={{ color: "#888" }}>Huawei OBS</strong>. It is never shared without your consent.
                </span>
              </div>
            </div>
          )}

          {/* Scanning stage */}
          {stage === "scanning" && (
            <div style={{ ...styles.scanningCard, animation: "fadeUp 0.3s ease forwards" }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
                {preview && <img src={preview} alt="" style={{ width: 240, height: 160, objectFit: "cover", borderRadius: 10, display: "block" }} />}
                {!preview && <div style={{ width: 240, height: 160, background: "rgba(255,107,53,0.08)", borderRadius: 10, border: "1px solid rgba(255,107,53,0.2)" }} />}
                {/* Scan line animation */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #FF6B35, transparent)", animation: "scanLine 1.2s ease-in-out infinite" }} />
                <div style={{ position: "absolute", inset: 0, border: "2px solid rgba(255,107,53,0.4)", borderRadius: 10 }} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, animation: "pulse 1.5s infinite" }}>Scanning with Huawei OCR...</div>
              <div style={{ fontSize: 13, color: "#666" }}>Reading your document · Extracting verified fields</div>
              <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
                {["Name", "ID Number", "Date of Birth", "Nationality"].map((field, i) => (
                  <div key={field} style={{ background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "#FF6B35", animation: `pulse 1s ${i * 0.2}s infinite` }}>
                    {field}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted stage */}
          {stage === "extracted" && extracted && (
            <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
              <div style={styles.extractedCard}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(78,205,196,0.15)", border: "1px solid rgba(78,205,196,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✓</div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#4ECDC4", fontSize: 14 }}>OCR Scan Complete</div>
                    <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace" }}>Confidence: {Math.round(extracted.confidence_score * 100)}% · Powered by Huawei OCR</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "First Name", value: extracted.first_name },
                    { label: "Last Name", value: extracted.last_name },
                    { label: "ID Number", value: extracted.id_number },
                    { label: "Date of Birth", value: extracted.date_of_birth },
                    { label: "Gender", value: extracted.gender },
                    { label: "Nationality", value: extracted.nationality },
                  ].map((f) => (
                    <div key={f.label} style={styles.extractedField}>
                      <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace", marginBottom: 4 }}>{f.label.toUpperCase()}</div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div style={styles.errorBanner}>{error}</div>}

              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <button className="arise-btn" onClick={handleConfirm} disabled={loading}>
                  {loading ? "Saving..." : "Confirm & Continue →"}
                </button>
                <button className="arise-btn-ghost" onClick={() => setStage("upload")}>Re-scan document</button>
              </div>
            </div>
          )}

          {/* Done */}
          {stage === "done" && (
            <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease forwards" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(78,205,196,0.15)", border: "2px solid #4ECDC4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px", animation: "checkPop 0.5s ease forwards" }}>✓</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#4ECDC4", marginBottom: 8 }}>Identity Verified!</h2>
              <p style={{ fontSize: 14, color: "#888" }}>+50 ECS points awarded. Moving to next step...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "40px 24px" },
  inner: { maxWidth: 600, margin: "0 auto" },
  progressBar: { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 56 },
  title: { fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, marginBottom: 12 },
  errorBanner: { background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.2)", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#FF8888", marginTop: 12 },
  securityNote: { display: "flex", alignItems: "flex-start", gap: 10, marginTop: 20, padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" },
  scanningCard: { textAlign: "center", padding: 40, background: "rgba(255,107,53,0.04)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center" },
  extractedCard: { background: "rgba(78,205,196,0.04)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 14, padding: 24 },
  extractedField: { background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 14px" },
};