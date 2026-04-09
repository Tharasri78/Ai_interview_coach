import { useState, useRef } from "react";
import { uploadPDF } from "../api/apiService";

export default function Upload({ userId, onUploaded }) {
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
      onUploaded(false); // reset flow
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

      if (res.data?.message) {
        setMsg("File Uploaded.");
        setStatus("success");
        onUploaded(true); // enable next step
      }
    } catch {
      setMsg("Upload failed.");
      setStatus("error");
    }

    setLoading(false);
  };

  return (
    <div className="card">

      <div className="card-title">Upload PDF</div>

      <div className="upload-dropzone" onClick={() => inputRef.current.click()}>
        {!file ? "Click to upload" : file.name}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {file && (
        <button onClick={handleUpload} className="btn btn-primary btn-full">
          {loading ? "Uploading..." : "Upload & Process"}
        </button>
      )}

      {status === "success" && <div className="msg msg-success">{msg}</div>}
      {status === "error" && <div className="msg msg-error">{msg}</div>}
    </div>
  );
}