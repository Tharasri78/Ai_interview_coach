import { useState, useRef } from "react";
import { uploadPDF } from "../api/apiService";
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

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
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadPDF(userId, formData);

      if (res.data?.message || res.status === 200) {
        setMsg("File uploaded successfully!");
        setStatus("success");
        onUploaded(true);
      }
    } catch {
      setMsg("Upload failed. Please try again.");
      setStatus("error");
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Upload PDF</div>
          <div className="card-sub">
            {isUploaded 
              ? "PDF uploaded — you're ready to practice!" 
              : "Step 1 — Upload your learning material (PDF only)"}
          </div>
        </div>
        {status === "success" && <span className="card-badge badge-success">Uploaded</span>}
      </div>

      <div 
        className={`upload-dropzone ${file ? "has-file" : ""}`}
        onClick={() => inputRef.current?.click()}
      >
        {!file ? (
          <>
            <div className="upload-icon"><FiUpload size={24} /></div>
            <div className="upload-text">Click to upload <strong>PDF</strong></div>
            <div className="upload-hint">Supports .pdf files only</div>
          </>
        ) : (
          <>
            <div className="upload-icon"><FiFile size={24} /></div>
            <div className="upload-text">{file.name}</div>
            <div className="upload-hint">Click to change file</div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {file && (
        <button 
          onClick={handleUpload} 
          className="btn btn-primary btn-full"
          disabled={loading}
        >
          {loading ? "Processing..." : "Upload & Process"}
        </button>
      )}

      {status === "success" && (
        <div className="msg msg-success">
          <FiCheckCircle size={14} style={{ marginRight: 6 }} /> {msg}
        </div>
      )}
      {status === "error" && (
        <div className="msg msg-error">
          <FiAlertCircle size={14} style={{ marginRight: 6 }} /> {msg}
        </div>
      )}
      
      {isUploaded && !file && (
        <div className="msg msg-info">
          Your PDF is already uploaded. You can upload a new one anytime to update your learning material.
        </div>
      )}
    </div>
  );
}