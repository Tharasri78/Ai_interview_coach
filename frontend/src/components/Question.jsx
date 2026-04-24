import { useState } from "react";
import { generateQuestion } from "../api/apiService";
import { FiRefreshCw, FiAlertCircle } from "react-icons/fi";

export default function Question({ userId, isUploaded, onQuestionGenerated, currentQuestion, topic, setTopic }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const generate = async () => {
  if (!userId) {
    setError("User not logged in. Please login again.");
    return;
  }
  if (!topic.trim()) {
    setError("Please enter a topic");
    return;
  }
  if (!isUploaded) {
    setError("Please upload a PDF first");
    return;
  }

  setLoading(true);
  setError("");
  setStatusMsg("Generating question...");

  try {
    const res = await generateQuestion(userId, topic);
    const response = res.data;

    onQuestionGenerated(response);

    // ✅ CLEAR LOADING MESSAGE IMMEDIATELY
    setStatusMsg("");

    if (response.fallback) {
      setError("Showing a general question (not from your PDF)");
    } else {
      setError("");
    }

  } catch (err) {
    console.error("Generation error:", err);
    setStatusMsg(""); // ✅ clear here also
    setError("Failed to generate. Please check your connection and try again.");
  }

  setLoading(false);
};

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Generate Question</div>
          <div className="card-sub">
            {!isUploaded 
              ? "Upload a PDF first to enable question generation" 
              : currentQuestion 
                ? "Question ready — you can generate another anytime" 
                : "Step 2 — Enter a topic to generate a question"}
          </div>
        </div>
        {currentQuestion && <span className="card-badge badge-info">Question Ready</span>}
      </div>

      {loading && <div className="loading-bar"><div className="loading-bar-fill" /></div>}

      <div className="field-label">Topic</div>
      <div className="input-group">
        <input
          className="text-input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          disabled={!isUploaded || loading}
        />
        <button 
          className="btn btn-blue" 
          onClick={generate} 
          disabled={loading || !isUploaded || !topic.trim()}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {statusMsg && (
        <div className="msg msg-info">
          <FiRefreshCw size={14} style={{ marginRight: 6 }} /> {statusMsg}
        </div>
      )}

      {error && (
        <div className="msg msg-warning" style={{ marginTop: 10 }}>
          <FiAlertCircle size={14} style={{ marginRight: 6 }} /> {error}
        </div>
      )}

      {currentQuestion && (
        <div className="question-box">
          {currentQuestion.fallback && (
  <div className="msg msg-warning">
    ⚠ Using general knowledge (not from your PDF)
  </div>
)}
          <div className="question-text">{currentQuestion.question}</div>
          {currentQuestion.difficulty && (
            <div className={`difficulty-chip ${currentQuestion.difficulty}`}>
              {currentQuestion.difficulty.toUpperCase()}
            </div>
          )}
          
          
        </div>
      )}
    </div>
  );
}