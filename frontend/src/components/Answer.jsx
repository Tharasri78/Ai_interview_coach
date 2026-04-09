import { useState, useEffect } from "react";
import { submitAnswer } from "../api/apiService";

export default function Answer({ questionData, disabled, onAnswered }) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState(""); // 🔥 NEW

  const userId = Number(localStorage.getItem("user_id"));

  useEffect(() => {
    setAnswer("");
    setResult(null);
    setError("");
    setStatusMsg(""); // 🔥 reset
  }, [questionData]);

  const submit = async () => {
    if (!answer.trim() || disabled || !questionData) return;

    setLoading(true);
    setResult(null);
    setError("");
    setStatusMsg("⏳ Evaluating your answer..."); // 🔥 ADD

    try {
      const res = await submitAnswer(userId, questionData.question, answer);

      setStatusMsg(""); // 🔥 clear loading message

      if (res.data.error) {
        setError(res.data.error);
        setLoading(false);
        return;
      }

      setResult(res.data);
      if (onAnswered) onAnswered();

    } catch (err) {
      setStatusMsg(""); // 🔥 clear loading
      setError(
        err.response?.data?.error ||
        "Try answering based on your uploaded PDF"
      );
    }

    setLoading(false);
  };

  const score = Math.round(result?.scores?.overall ?? 0);
  const percentage = score * 10;

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
        placeholder="Type your answer here..."
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
        {loading ? "..." : "Submit Answer →"}
      </button>

      {/* 🟢 STATUS (ONLY WHILE LOADING) */}
      {statusMsg && (
        <div className="msg msg-info" style={{ marginTop: 12 }}>
          {statusMsg}
        </div>
      )}

      {/* 🔴 ERROR (ONLY WHEN NOT LOADING) */}
      {error && !statusMsg && (
        <div className="msg msg-error" style={{ marginTop: 12 }}>
          ✕ {error}
        </div>
      )}

      {/* ✅ RESULT */}
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
              <div className="result-section-label">AI Analysis</div>

              <div className="feedback-block">
                <strong>❌ Issues:</strong>
                <p>{result.feedback.issues}</p>
              </div>

              <div className="feedback-block">
                <strong>⚠ Missing Concepts:</strong>
                <p>{result.feedback.missing}</p>
              </div>

              <div className="feedback-block ideal">
                <strong>✅ Ideal Answer:</strong>
                <p>{result.feedback.ideal}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}