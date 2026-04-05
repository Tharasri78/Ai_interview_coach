import { useState } from "react";
import { generateQuestion } from "../api/apiService";

export default function Question({ disabled, onQuestion }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // ✅ FIX: get userId
  const userId = localStorage.getItem("user_id");

  const generate = async () => {
    if (!topic.trim() || disabled) return;

    setLoading(true);
    setData(null);
    setError("");

    try {
      const res = await generateQuestion(userId, topic);
      setData(res.data);
      onQuestion(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to generate. Make sure a PDF is uploaded."
      );
    }

    setLoading(false);
  };

  return (
    <div className="card" style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon blue">🎯</div>
          <div>
            <div className="card-title">Generate Question</div>
            <div className="card-sub">{disabled ? "Upload PDF first" : "Step 2 — Enter a topic"}</div>
          </div>
        </div>
        {data && <span className="card-badge badge-info">Ready</span>}
      </div>

      {loading && <div className="loading-bar"><div className="loading-bar-fill" /></div>}

      <div className="field-label">Topic</div>
      <div className="input-group">
        <input
          className="text-input"
          placeholder="e.g. Neural Networks, Binary Search..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          disabled={disabled}
        />
        <button
          className="btn btn-blue"
          onClick={generate}
          disabled={loading || !topic.trim() || disabled}
        >
          {loading ? "..." : "Generate"}
        </button>
      </div>

      {error && <div className="msg msg-error">✕ {error}</div>}

      {data && (
        <div className="question-box">
          <div className="question-text">{data.question}</div>
          <div className="question-meta">
            <span className="meta-chip chip-src">📌 {data.topic}</span>
          </div>
        </div>
      )}
    </div>
  );
}