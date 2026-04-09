import { useState } from "react";
import { generateQuestion } from "../api/apiService";

export default function Question({ disabled, onQuestion }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const userId = Number(localStorage.getItem("user_id"));

  const generate = async () => {
    if (!userId) {
  setError("User not logged in. Please login again.");
  return;
} 
    if (!topic.trim() || disabled) return;

    setLoading(true);
    setData(null);
    setError("");
    setStatusMsg("⏳ Generating question...");

    try {
      const res = await generateQuestion(userId, topic);

      const response = res.data;

      setData(response);
      onQuestion(response);

      if (response.fallback) {
        setError("⚠ Showing a general question (not from your PDF)");
      } else {
        setError("");
      }

    } catch (err) {
      setError("Try a different topic.");
    }

    setLoading(false);
    setStatusMsg("");
  };

  return (
    <div className="card" style={{ opacity: disabled ? 0.5 : 1 }}>
      
      <div className="card-header">
        <div>
          <div className="card-title">Generate Question</div>
          <div className="card-sub">
            {disabled ? "Upload PDF first" : "Step 2 — Enter a topic"}
          </div>
        </div>
        {data && <span className="card-badge badge-info">Ready</span>}
      </div>

      {loading && <div className="loading-bar"><div className="loading-bar-fill" /></div>}

      <div className="field-label">Topic</div>
      <div className="input-group">
        <input
          className="text-input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          disabled={disabled}
        />
        <button className="btn btn-blue" onClick={generate} disabled={loading || disabled}>
          {loading ? "..." : "Generate"}
        </button>
      </div>

      {statusMsg && <div className="msg msg-info">{statusMsg}</div>}

      {error && <div className="error-box"><div>{error}</div></div>}

      {data && (
        <div className="question-box">
          <div className="question-text">{data.question}</div>
        </div>
      )}
    </div>
  );
}