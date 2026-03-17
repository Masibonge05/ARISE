import { useState } from "react";
import api from "../services/api";

export function useHuaweiOCR() {
  const [scanning, setScanning]   = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);

  const scanFile = async (file, documentType = "id") => {
    setScanning(true); setError(null); setResult(null);
    try {
      const base64 = await fileToBase64(file);
      const res = await api.post("/trustid/scan-document", {
        file_base64: base64,
        document_type: documentType,
      });
      setResult(res.data);
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.detail || "OCR scan failed";
      setError(msg);
      throw e;
    } finally { setScanning(false); }
  };

  return { scanFile, scanning, result, error, reset: () => { setResult(null); setError(null); } };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default useHuaweiOCR;