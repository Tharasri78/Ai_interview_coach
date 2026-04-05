import { useState, useEffect } from "react";
import { submitAnswer } from "../api/apiService";

export default function Answer({ questionData, disabled, onAnswered }) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const userId = Number(localStorage.getItem("user_id"));

  // ✅ Reset when new question comes
  useEffect(() => {
    setAnswer("");
    setResult(null);
  }, [questionData]);

  const submit = async () => {
    // ✅ FIX: added questionData check
    if (!answer.trim() || disabled || !questionData) return;

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await submitAnswer(userId, questionData.question, answer);

      // ✅ FIX: handle backend error response
      if (res.data.error) {
        setError(res.data.error);
        setLoading(false);
        return;
      }

      setResult(res.data);

      if (onAnswered) onAnswered(); // trigger history refresh
    } catch (err) {
       setError(
  err.response?.data?.error ||
  err.response?.data?.message ||
  "Submission failed. Please try again."
);
    }

    setLoading(false);
  };

  // ✅ FIX: safer score extraction
const score = Math.round(result?.scores?.overall ?? result?.score ?? 0);
const percentage = score * 10; // convert /10 → /100 for UI

  const missingPoints = result?.missing
    ? Array.isArray(result.missing)
      ? result.missing
      : result.missing
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
    : [];

  return (
    <div
      className="card"
      style={{
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon purple">✍️</div>
          <div>
            <div className="card-title">Submit Your Answer</div>
            <div className="card-sub">
              {disabled
                ? "Generate a question first"
                : "Step 3 — Write your answer"}
            </div>
          </div>
        </div>

        {result && (
          <span
            className={`card-badge ${
              score >= 8 ? "badge-success" : "badge-info"
            }`}
          >
            Score: {score}/10
          </span>
        )}
      </div>

      {loading && (
        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>
      )}

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

      <button
        className="btn btn-blue btn-full"
        style={{ marginTop: 14 }}
        onClick={submit}
        disabled={loading || !answer.trim() || disabled}
      >
        {loading ? "Evaluating..." : "Submit Answer →"}
      </button>

      {error && (
        <div className="msg msg-error" style={{ marginTop: 12 }}>
          ✕ {error}
        </div>
      )}

      {result && (
        <div className="result-box">
          <div className="score-row">
            <div className="score-circle" style={{ "--score": percentage }}>
              <span className="score-num">{score}/10</span>
            </div>

            <div className="score-info">
              <h4>
                {score >= 8
                  ? "Excellent!"
                  : score >= 6
                  ? "Good effort"
                  : "Needs improvement"}
              </h4>
              <p>Overall score out of 10</p>
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
                {missingPoints.map((pt, i) => (
                  <li key={i}>⚠ {pt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}