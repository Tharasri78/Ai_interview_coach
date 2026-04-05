import { useState, useRef } from "react";
import { uploadPDF } from "../api/apiService";

export default function Upload({ userId, onUploaded, isUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(null);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (f?.type === "application/pdf") {
      setFile(f);
      setStatus(null);
      setMsg("");
    } else {
      setMsg("Please select a valid PDF file.");
      setStatus("error");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setStatus(null);
    setMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadPDF(userId, formData);

      setMsg("PDF uploaded successfully.");
      setStatus("success");
      onUploaded();
    } catch (err) {
      setMsg(err.response?.data?.detail || "Upload failed.");
      setStatus("error");
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <h3>Upload PDF</h3>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {file && (
        <button onClick={handleUpload} disabled={loading || isUploaded}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      )}

      {status === "success" && <p style={{ color: "green" }}>{msg}</p>}
      {status === "error" && <p style={{ color: "red" }}>{msg}</p>}
    </div>
  );
}