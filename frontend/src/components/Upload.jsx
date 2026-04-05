import { useState, useRef } from "react";
import API from "../api";

export default function Upload({ userId, onUploaded, isUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(null);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (f?.type === "application/pdf") {
      setFile(f); setStatus(null); setMsg("");
    } else {
      setMsg("Please select a valid PDF file."); setStatus("error");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true); setStatus(null); setMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // ✅ Fixed endpoint: /upload-resume/ (matches backend)
      const name = localStorage.getItem("user_name") || "User";
      const email = localStorage.getItem("user_email") || "test@test.com";

      await API.post(`/upload-resume/?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`, formData);
      setMsg("PDF uploaded and indexed successfully.");
      setStatus("success");
      onUploaded();
    } catch (err) {
      setMsg(err.response?.data?.detail || "Upload failed. Check backend.");
      setStatus("error");
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon green">📄</div>
          <div>
            <div className="card-title">Upload Study Material</div>
            <div className="card-sub">PDF only · Step 1</div>
          </div>
        </div>
        {isUploaded && <span className="card-badge badge-success">✓ Ready</span>}
      </div>

      {loading && <div className="loading-bar"><div className="loading-bar-fill" /></div>}

      <div
        className={`upload-dropzone ${file ? "has-file" : ""}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      >
        <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])} />
        <div className="upload-icon">{file ? "✅" : "📤"}</div>
        <div className="upload-text">
          {file ? <strong>{file.name}</strong> : <><strong>Click to browse</strong> or drag &amp; drop</>}
        </div>
        <div className="upload-hint">{file ? `${(file.size / 1024).toFixed(0)} KB` : "PDF files only"}</div>
      </div>

      {file && !isUploaded && (
        <button className="btn btn-blue btn-full" style={{ marginTop: 16 }}
          onClick={handleUpload} disabled={loading|| isUploaded}>
          {loading ? "Uploading..." : "⬆ Upload PDF"}
        </button>
      )}

      {status === "success" && <div className="msg msg-success">✓ {msg}</div>}
      {status === "error"   && <div className="msg msg-error">✕ {msg}</div>}
    </div>
  );
}