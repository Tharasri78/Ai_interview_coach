import { useState } from "react";
import { generateQuestion } from "../api/apiService";

export default function Question({ disabled, onQuestion }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const userId = localStorage.getItem("user_id");

  const generate = async () => {
    if (!topic.trim() || disabled) return;

    setLoading(true);
    setData(null);
    setError("");
    setStatusMsg("⏳ Checking topic relevance...");

    try {
      const res = await generateQuestion(userId, topic);

      // 🔥 CLEAR loading message immediately after response
      setStatusMsg("");

      // 🔴 BACKEND ERROR
      if (res.data.error) {
        setError(res.data.error);
        setLoading(false);
        return;
      }

      // ✅ SUCCESS
      setData(res.data);
      onQuestion(res.data);

      if (res.data.fallback) {
        setError("⚠ Showing a related question from your PDF. Try refining your topic.");
      } else {
        setError("");
      }

    } catch (err) {
      setStatusMsg(""); // clear loading
      setError("Try topics related to your uploaded PDF");
    }

    setLoading(false);
  };

  return (
    <div
      className="card"
      style={{
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto"
      }}
    >
      <div className="card-header">
        <div className="card-title-group">
          <div>
            <div className="card-title">Generate Question</div>
            <div className="card-sub">
              {disabled ? "Upload PDF first" : "Step 2 — Enter a topic"}
            </div>
          </div>
        </div>
        {data && <span className="card-badge badge-info">Ready</span>}
      </div>

      {loading && (
        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>
      )}

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

      {/* 🟢 STATUS (ONLY DURING LOADING) */}
      {statusMsg && (
        <div className="msg msg-info" style={{ marginTop: 12 }}>
          {statusMsg}
        </div>
      )}

      {/* 🔴 ERROR */}
      {error && !statusMsg && (
        <div className="error-box">
          <div className="error-sub">{error}</div>
        </div>
      )}

      {/* ✅ RESULT */}
      {data && (
        <div className="question-box">
          <div className="question-text">{data.question}</div>
          <div className="question-meta"></div>
        </div>
      )}
    </div>
  );
}