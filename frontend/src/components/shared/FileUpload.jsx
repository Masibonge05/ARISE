import { useState, useRef } from "react";
import { formatFileSize } from "../../utils/formatters";
import { isAllowedDocType, isFileSizeOK } from "../../utils/validators";

export default function FileUpload({ onFile, accept=".jpg,.jpeg,.png,.pdf", maxMB=10, label="Upload file", hint="", disabled=false }) {
  const [dragging, setDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError]       = useState(null);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setError(null);
    const allowedTypes = ["image/jpeg","image/png","image/webp","application/pdf","image/bmp"];
    if (!allowedTypes.includes(file.type)) { setError("File type not allowed. Use JPG, PNG, or PDF."); return; }
    if (!isFileSizeOK(file, maxMB)) { setError(`File too large. Max ${maxMB}MB.`); return; }
    setFileInfo({ name: file.name, size: file.size, type: file.type });
    onFile?.(file);
  };

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        style={{ border:`2px dashed ${dragging?"#FF6B35":error?"rgba(255,68,68,0.4)":"rgba(255,255,255,0.12)"}`, borderRadius:10, padding:"24px 16px", textAlign:"center", cursor:disabled?"not-allowed":"pointer", background:dragging?"rgba(255,107,53,0.04)":fileInfo?"rgba(78,205,196,0.04)":"rgba(255,255,255,0.02)", transition:"all 0.2s" }}>
        <div style={{ fontSize:28, marginBottom:8 }}>{fileInfo ? "✅" : "📄"}</div>
        <div style={{ fontSize:13, fontWeight:600, color:fileInfo?"#4ECDC4":"#888" }}>
          {fileInfo ? fileInfo.name : label}
        </div>
        {fileInfo && <div style={{ fontSize:11, color:"#555", marginTop:3 }}>{formatFileSize(fileInfo.size)}</div>}
        {!fileInfo && <div style={{ fontSize:11, color:"#555", marginTop:4 }}>Click or drag & drop · Max {maxMB}MB</div>}
        {hint && <div style={{ fontSize:11, color:"#555", marginTop:2 }}>{hint}</div>}
      </div>
      {error && <div style={{ fontSize:11, color:"#FF6666", marginTop:6 }}>⚠ {error}</div>}
      {fileInfo && <button onClick={() => { setFileInfo(null); onFile?.(null); }} style={{ marginTop:6, fontSize:11, color:"#888", background:"none", border:"none", cursor:"pointer" }}>Remove file</button>}
      <input ref={inputRef} type="file" accept={accept} onChange={(e) => handleFile(e.target.files[0])} style={{ display:"none" }} />
    </div>
  );
}