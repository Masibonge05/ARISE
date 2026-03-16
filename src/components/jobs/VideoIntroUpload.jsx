import { useState, useRef } from "react";
export default function VideoIntroUpload({ onFile, maxMB=50 }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  const handleFile = (f) => {
    setError(null);
    if (!f) return;
    if (!f.type.startsWith("video/")) { setError("Please upload a video file."); return; }
    if (f.size > maxMB*1024*1024) { setError(`Video must be under ${maxMB}MB.`); return; }
    setFile(f);
    onFile?.(f);
  };

  return (
    <div>
      <div onClick={() => inputRef.current?.click()}
        style={{ border:"2px dashed rgba(255,255,255,0.12)", borderRadius:10, padding:"20px 16px", textAlign:"center", cursor:"pointer", background:file?"rgba(78,205,196,0.04)":"rgba(255,255,255,0.02)" }}>
        <div style={{ fontSize:28, marginBottom:8 }}>{file?"🎬":"📹"}</div>
        <div style={{ fontSize:13, color:file?"#4ECDC4":"#888", fontWeight:600 }}>{file?file.name:"Upload a 60-second video intro (optional)"}</div>
        <div style={{ fontSize:11, color:"#555", marginTop:3 }}>Max {maxMB}MB · MP4 or MOV</div>
      </div>
      {error && <div style={{ fontSize:11, color:"#FF6666", marginTop:6 }}>⚠ {error}</div>}
      <input ref={inputRef} type="file" accept="video/*" onChange={e => handleFile(e.target.files[0])} style={{ display:"none" }} />
    </div>
  );
}