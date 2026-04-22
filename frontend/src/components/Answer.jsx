import { useState, useEffect } from "react";
import { submitAnswer } from "../api/apiService";
import { FiRotateCcw, FiPlusCircle } from "react-icons/fi";

export default function Answer({ 
  userId, 
  currentQuestion, 
  onAnswerSubmit, 
  onTryAgain, 
  onNewQuestion,
  answerSubmitted,
  currentResult 
}) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [localResult, setLocalResult] = useState(null);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (currentQuestion && !answerSubmitted) {
      setAnswer("");
      setLocalResult(null);
      setError("");
    }
  }, [currentQuestion]);

  const result = currentResult || localResult;

  const submit = async () => {
    if (!answer.trim() || !currentQuestion) {
      setError("Please write an answer before submitting");
      return;
    }

    setLoading(true);
    setLocalResult(null);
    setError("");
    setStatusMsg("Evaluating your answer...");

    try {
      const res = await submitAnswer(userId, currentQuestion.question, answer);

      setStatusMsg("");

      if (res.data.error) {
        setError(res.data.error);
        setLoading(false);
        return;
      }

      setLocalResult(res.data);
      if (onAnswerSubmit) onAnswerSubmit(res.data);

    } catch (err) {
      setStatusMsg("");
      setError(
        err.response?.data?.error ||
        "Failed to evaluate. Please try again."
      );
    }

    setLoading(false);
  };

  const handleTryAgain = () => {
    setAnswer("");
    setLocalResult(null);
    setError("");
    if (onTryAgain) onTryAgain();
  };

  const handleNewQuestion = () => {
    setAnswer("");
    setLocalResult(null);
    setError("");
    if (onNewQuestion) onNewQuestion();
  };

  const score = Math.round(result?.scores?.overall ?? 0);
  const percentage = score * 10;

  if (answerSubmitted && result) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <div>
              <div className="card-title">Answer Result</div>
              <div className="card-sub">Your answer has been evaluated</div>
            </div>
          </div>
          <span className={`card-badge ${score >= 8 ? "badge-success" : "badge-info"}`}>
            Score: {score}/10
          </span>
        </div>

        <div className="result-box">
          <div className="score-row">
            <div className="score-circle" style={{ "--score": percentage }}>
              <span className="score-num">{score}/10</span>
            </div>
            <div className="score-info">
              <h4>
                {score >= 8 ? "Excellent!" : score >= 6 ? "Good effort" : "Needs improvement"}
              </h4>
              <p>Overall score out of 10</p>
            </div>
          </div>

          {result.feedback && (
            <>
              <div className="result-section">
                <div className="result-section-label">Issues</div>
                <p className="result-text">{result.feedback.issues || "No specific issues"}</p>
              </div>

              {result.feedback.missing && result.feedback.missing !== "None" && result.feedback.missing !== "" && (
                <div className="result-section">
                  <div className="result-section-label">Missing Concepts</div>
                  <p className="result-text">{result.feedback.missing}</p>
                </div>
              )}

              {result.feedback.ideal && (
                <div className="result-section">
                  <div className="result-section-label">Ideal Answer</div>
                  <p className="result-text">{result.feedback.ideal}</p>
                </div>
              )}

              {result.feedback.improved_answer && (
                <div className="result-section">
                  <div className="result-section-label">Suggested Answer</div>
                  <p className="result-text">{result.feedback.improved_answer}</p>
                </div>
              )}
            </>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleTryAgain}>
              <FiRotateCcw size={16} /> Try Again
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleNewQuestion}>
              New Question <FiPlusCircle size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div>
            <div className="card-title">Submit Your Answer</div>
            <div className="card-sub">
              {!currentQuestion 
                ? "Generate a question first" 
                : answerSubmitted 
                  ? "Answer submitted — check results above" 
                  : "Step 3 — Write your answer"}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>
      )}

     
      <div className="field-label">Your Answer</div>
      <textarea
        className="textarea-input"
        placeholder="Type your answer here..."
        rows={5}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={!currentQuestion || answerSubmitted}
      />

      <button
        className="btn btn-blue btn-full"
        style={{ marginTop: 14 }}
        onClick={submit}
        disabled={loading || !answer.trim() || !currentQuestion || answerSubmitted}
      >
        {loading ? "Evaluating..." : "Submit Answer"}
      </button>

      {statusMsg && (
        <div className="msg msg-info" style={{ marginTop: 12 }}>
          {statusMsg}
        </div>
      )}

      {error && !statusMsg && (
        <div className="msg msg-error" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}