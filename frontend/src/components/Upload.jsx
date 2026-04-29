import { useState, useRef, useEffect } from "react";
import { uploadPDF } from "../api/apiService";
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function Upload({ userId, onUploaded, isUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(null);
  const inputRef = useRef();

  // Clear stale localStorage on component mount
  useEffect(() => {
    // Remove any stale upload flags
    const staleFlag = localStorage.getItem("uploaded");
    if (staleFlag === "true") {
      console.log("Clearing stale upload flag from localStorage");
      localStorage.removeItem("uploaded");
    }
  }, []);

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

      if (res.data?.status === "success" || res.status === 200) {
        setMsg("PDF uploaded successfully");
        setStatus("success");
        localStorage.setItem("uploaded", "true");
        localStorage.setItem("uploaded_file_name", file.name);
        onUploaded(true);
        setFile(null); // Clear file after successful upload
      } else {
        setMsg("Upload failed. Please try again.");
        setStatus("error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMsg("Upload failed. Please try again.");
      setStatus("error");
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Resume Upload</div>
          <div className="card-sub">
            {isUploaded 
              ? "Resume ready - you can begin your interview preparation" 
              : "Upload your resume (PDF format only)"}
          </div>
        </div>
        {status === "success" && <span className="card-badge badge-success">Uploaded</span>}
      </div>

      <div 
        className={`upload-dropzone ${file ? "has-file" : ""} ${isUploaded ? "disabled" : ""}`}
        onClick={() => !isUploaded && inputRef.current?.click()}
        style={{ cursor: isUploaded ? "not-allowed" : "pointer", opacity: isUploaded ? 0.6 : 1 }}
      >
        {!file ? (
          <>
            <div className="upload-icon"><FiUpload size={24} /></div>
            <div className="upload-text">Click to upload <strong>PDF</strong></div>
            <div className="upload-hint">Maximum file size: 10MB</div>
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

      {file && !isUploaded && (
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
      
      
    </div>
  );
}