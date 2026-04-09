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

    // 🔥 CRITICAL FIX
    setStatus(null);
    setMsg("");

    // 🔥 RESET DASHBOARD FLOW
    onUploaded(false);  // 👈 THIS FIXES YOUR ISSUE

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
  const res = await uploadPDF(userId, formData);

  if (res.data?.status === "success") {
  setMsg("File Uploaded.");
  setStatus("success");

  onUploaded(true);  
} else {
  setMsg("Upload failed.");
  setStatus("error");

  onUploaded(false);
}

} catch (err) {
   console.error("UPLOAD ERROR:", err); 
  setMsg(
    err.response?.data?.error ||
    err.response?.data?.message ||
    "Upload failed."
  );
  setStatus("error");
}

    setLoading(false);
  };

  return (
  <div className="card">

    {/* Header */}
    <div className="card-header">
      <div className="card-title-group">
        <div>
          <div className="card-title">Upload PDF</div>
          <div className="card-sub">
            Upload resume or study material to generate better questions
          </div>
          <div className="upload-hint">
            Supported: Resume, Notes, Study PDFs
          </div>
        </div>
      </div>
    </div>

    {/* DROPZONE (use your CSS) */}
    <div
      className={`upload-dropzone ${file ? "has-file" : ""}`}
      onClick={() => inputRef.current.click()}
    >
      <div className="upload-icon">📂</div>

      {!file ? (
        <div className="upload-text">
          <strong>Click to upload</strong> or drag and drop
        </div>
      ) : (
        <div className="upload-text">
          Selected: <strong>{file.name}</strong>
        </div>
      )}
    </div>

    {/* Hidden Input */}
    <input
      ref={inputRef}
      type="file"
      accept=".pdf"
      style={{ display: "none" }}
      onChange={(e) => handleFile(e.target.files[0])}
    />

    {/* Upload Button */}
    {file && (
      <div style={{ marginTop: 12 }}>
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="btn btn-primary btn-full"
        >
          {loading ? "Uploading..." : "Upload & Process"}
        </button>
      </div>
    )}

    {/* Messages */}
    {status === "success" && (
      <div className="msg msg-success">{msg}</div>
    )}

    {status === "error" && (
      <div className="msg msg-error">{msg}</div>
    )}

  </div>
);
  
}