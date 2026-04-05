import { useState, useEffect } from "react";
import API from "../api";

export default function Answer({ userId, questionData, disabled, onAnswered }) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
  setAnswer("");
  setResult(null);
}, [questionData]);

  const submit = async () => {
    if (!answer.trim() || disabled) return;
    setLoading(true); setResult(null); setError("");

    try {
      const res = await API.post("/submit-answer/", {
        user_id: userId,
        question: questionData.question,
        answer,
      });
      setResult(res.data);
      if (onAnswered) onAnswered(); // trigger history refresh
    } catch (err) {
      setError(err.response?.data?.detail || "Submission failed. Please try again.");
    }
    setLoading(false);
  };

  const score = result?.scores?.overall ?? 0; 
  const missingPoints = result?.missing
    ? (Array.isArray(result.missing) ? result.missing : result.missing.split(",").map(p => p.trim()).filter(Boolean))
    : [];

  return (
    <div className="card" style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon purple">✍️</div>
          <div>
            <div className="card-title">Submit Your Answer</div>
            <div className="card-sub">{disabled ? "Generate a question first" : "Step 3 — Write your answer"}</div>
          </div>
        </div>
        {result && (
          <span className={`card-badge ${score >= 75 ? "badge-success" : "badge-info"}`}>
            Score: {score}/100
          </span>
        )}
      </div>

      {loading && <div className="loading-bar"><div className="loading-bar-fill" /></div>}

      {questionData ? (
        <div className="msg msg-info" style={{ marginBottom: 16 }}>
          📌 {questionData.question}
        </div>
      ) : (
        <div className="msg msg-info" style={{ marginBottom: 16 }}>
          💡 Generate a question first, then answer here.
        </div>
      )}

      <div className="field-label">Your Answer</div>
      <textarea
        className="textarea-input"
        placeholder="Type your answer here. Be as detailed as possible..."
        rows={5}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={disabled}
      />

      <button className="btn btn-blue btn-full" style={{ marginTop: 14 }}
        onClick={submit} disabled={loading || !answer.trim() || disabled}>
        {loading ? "Evaluating..." : "Submit Answer →"}
      </button>

      {error && <div className="msg msg-error" style={{ marginTop: 12 }}>✕ {error}</div>}

      {result && (
        <div className="result-box">
          <div className="score-row">
            <div className="score-circle" style={{ "--score": score }}>
              <span className="score-num">{score}</span>
            </div>
            <div className="score-info">
              <h4>{score >= 85 ? "Excellent!" : score >= 65 ? "Good effort" : "Needs improvement"}</h4>
              <p>Overall score out of 100</p>
            </div>
          </div>

          {result.feedback && (
            <div className="result-section">
              <div className="result-section-label">Feedback</div>
              <div className="result-text">{result.feedback}</div>
            </div>
          )}

          {missingPoints.length > 0 && (
            <div className="result-section">
              <div className="result-section-label">Missing Points</div>
              <ul className="missing-list">
                {missingPoints.map((pt, i) => <li key={i}>⚠ {pt}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}