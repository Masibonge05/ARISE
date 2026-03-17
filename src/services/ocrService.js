import api from "./api";

export const ocrService = {
  /**
   * Convert a File object to base64 and scan via Huawei OCR
   */
  async scanDocument(file, documentType = "id") {
    const base64 = await fileToBase64(file);
    const res = await api.post("/trustid/scan-document", {
      file_base64: base64,
      document_type: documentType,
    });
    return res.data;
  },

  async scanID(file) {
    return ocrService.scanDocument(file, "id");
  },

  async scanCertificate(file) {
    return ocrService.scanDocument(file, "certificate");
  },

  async scanCIPC(file) {
    return ocrService.scanDocument(file, "cipc");
  },
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default ocrService;