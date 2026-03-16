import { useState } from "react";
import api from "../services/api";

export function useHuaweiNLP() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult]     = useState(null);

  const scanJobContent = async (title, description) => {
    setScanning(true);
    try {
      const res = await api.post("/safety/scan-content", { title, description });
      setResult(res.data);
      return res.data;
    } catch { return { passed: true, risk_level: "low" }; }
    finally { setScanning(false); }
  };

  const translateText = async (text, targetLanguage) => {
    try {
      const res = await api.post("/users/me/translate", { text, target_language: targetLanguage });
      return res.data.translated_text || text;
    } catch { return text; }
  };

  return { scanJobContent, translateText, scanning, result };
}

export default useHuaweiNLP;