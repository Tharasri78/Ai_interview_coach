import { useState, useEffect } from "react";
import { nextStep } from "../api/apiService";
import { 
  FiArrowRight, 
  FiCheck, 
  FiCode, 
  FiMessageSquare, 
  FiCpu,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo
} from "react-icons/fi";

export default function InterviewBox({ userId, question, round, index, total, onNext }) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [nextData, setNextData] = useState(null);
  const [showNext, setShowNext] = useState(false);
  const [finished, setFinished] = useState(false);
  const [summary, setSummary] = useState(null);
  const [answerHints, setAnswerHints] = useState([]);
  const [transitioning, setTransitioning] = useState(false);

  // Round configuration
  const roundConfig = {
    1: { name: "HR Round", icon: <FiMessageSquare size={16} /> },
    2: { name: "Technical Round", icon: <FiCode size={16} /> },
    3: { name: "Deep Dive", icon: <FiCpu size={16} /> }
  };

  // Reset transition state for new question
  useEffect(() => {
    setTransitioning(false);
  }, [question]);

  const getQuestionText = () => {
    if (transitioning) return "Loading next question...";
    if (loading) return "Generating question...";
    if (typeof question === 'string') return question;
    if (question?.question) return question.question;
    return "Loading...";
  };

  // Real-time answer quality analysis
  const analyzeAnswerQuality = (text) => {
    const hints = [];
    
    if (text.length === 0) {
      hints.push({ type: "info", message: "Start typing your answer..." });
    } else if (text.length < 50) {
      hints.push({ type: "warning", message: "Add more detail - provide specific examples" });
    } else if (text.length < 150) {
      hints.push({ type: "info", message: "Good start - add technical depth" });
    } else if (text.length >= 150 && text.length <= 500) {
      hints.push({ type: "success", message: "Good length - well structured" });
    } else {
      hints.push({ type: "warning", message: "Consider being more concise" });
    }
    
    const starKeywords = ["situation", "task", "action", "result", "context", "goal", "outcome"];
    const found = starKeywords.filter(kw => text.toLowerCase().includes(kw));
    
    if (found.length < 3) {
      hints.push({ type: "warning", message: "Use STAR method: Situation, Task, Action, Result" });
    } else {
      hints.push({ type: "success", message: "Good structure using STAR method" });
    }
    
    setAnswerHints(hints.slice(0, 2));
  };

  const handleAnswerChange = (e) => {
    const text = e.target.value;
    setAnswer(text);
    analyzeAnswerQuality(text);
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setLoading(true);

    try {
      const res = await nextStep(userId, answer);

      if (res.data.finished) {
        setSummary(res.data.summary);
        setFinished(true);
        return;
      }

      setEvaluation(res.data.evaluation);
      setNextData(res.data);
      setShowNext(true);

    } catch (err) {
      console.error("Submit error:", err);
    }

    setLoading(false);
  };

  const handleNextWithTransition = () => {
    setTransitioning(true);
    setShowNext(false);
    setEvaluation(null);
    setAnswer("");
    setAnswerHints([]);
    
    setTimeout(() => {
      onNext(nextData);
      setTransitioning(false);
    }, 300);
  };

  // Interview Completed Screen
  if (finished) {
    const overallScore = summary?.avg_score || 0;
    const scoreLevel = overallScore >= 7 ? "Advanced" : overallScore >= 5 ? "Intermediate" : "Beginner";
    const passStatus = overallScore >= 6 ? "Passed" : "Needs Improvement";
    
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            borderRadius: "50%", 
            background: overallScore >= 6 ? "#ECFDF5" : "#FEF2F2",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            {overallScore >= 6 ? <FiCheckCircle size={40} color="#059669" /> : <FiAlertCircle size={40} color="#DC2626" />}
          </div>
          <h2>Interview Completed</h2>
          <p style={{ color: "#6B7080" }}>You've completed all 6 questions</p>
        </div>

        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: 40, 
          marginBottom: 24,
          padding: 20,
          background: "#F8F9FC",
          borderRadius: 12
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: "bold", color: "#4F46E5" }}>{overallScore.toFixed(1)}</div>
            <div style={{ fontSize: 12, color: "#6B7080" }}>Overall Score</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: "bold", color: overallScore >= 6 ? "#059669" : "#D97706" }}>{passStatus}</div>
            <div style={{ fontSize: 12, color: "#6B7080" }}>Status</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: "bold", color: "#4F46E5" }}>{scoreLevel}</div>
            <div style={{ fontSize: 12, color: "#6B7080" }}>Level</div>
          </div>
        </div>

        <div style={{ marginBottom: 24, textAlign: "left" }}>
          <h3 style={{ marginBottom: 12 }}>Performance Summary</h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, padding: 12, background: "#EEF2FF", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#4F46E5" }}>Strengths</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{summary?.strong?.substring(0, 60) || "Good communication"}...</div>
            </div>
            <div style={{ flex: 1, padding: 12, background: "#FFFBEB", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#D97706" }}>Areas to Improve</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{summary?.weak?.substring(0, 60) || "Technical depth"}...</div>
            </div>
          </div>
        </div>

        {(summary?.suggestions || []).length > 0 && (
          <div style={{ marginBottom: 24, textAlign: "left", padding: 16, background: "#F8F9FC", borderRadius: 8 }}>
            <h4 style={{ marginBottom: 8 }}>Recommendations</h4>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {summary.suggestions.slice(0, 3).map((tip, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <button 
          className="btn btn-primary btn-full" 
          onClick={() => window.location.reload()}
        >
          Start New Interview
        </button>
      </div>
    );
  }

  const progressPercent = ((index - 1) / total) * 100;
  const currentRoundData = roundConfig[round] || roundConfig[1];

  return (
    <div className="card">
      {/* Progress Bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 6,
              padding: "4px 12px",
              background: "#EEF2FF",
              borderRadius: 20
            }}>
              {currentRoundData.icon}
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{currentRoundData.name}</span>
            </div>
            <span style={{ fontSize: "0.85rem", color: "#6B7080" }}>
              Question {index} of {total}
            </span>
          </div>
        </div>
        
        <div style={{ height: 6, background: "#E8E9EF", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ 
            width: `${progressPercent}%`, 
            height: "100%", 
            background: "linear-gradient(90deg, #4F46E5, #7C3AED)",
            transition: "width 0.3s ease"
          }} />
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: "0.7rem", color: "#6B7080" }}>
          <span>HR Round</span>
          <span>Technical Round</span>
          <span>Deep Dive</span>
        </div>
      </div>

      {/* Question Card */}
      <div style={{ 
        background: "#F8F9FC", 
        padding: 24, 
        borderRadius: 12,
        marginBottom: 24,
        borderLeft: "4px solid #4F46E5"
      }}>
        <div style={{ fontSize: "0.7rem", color: "#4F46E5", marginBottom: 10, textTransform: "uppercase" }}>
          Interview Question
        </div>
        <div style={{ fontSize: "1rem", lineHeight: 1.6, color: "#0F1117", fontWeight: 500 }}>
          {getQuestionText()}
        </div>
      </div>

      {/* Answer Section */}
      {!showNext && (
        <>
          <div style={{ marginBottom: 20 }}>
            <label className="field-label">Your Answer</label>
            <textarea
              className="textarea-input"
              value={answer}
              onChange={handleAnswerChange}
              placeholder="Type your answer here. Use the STAR method for best results."
              rows={6}
              style={{ fontSize: "0.9rem", lineHeight: 1.6 }}
            />
          </div>

          {answerHints.length > 0 && answer.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              {answerHints.map((hint, idx) => (
                <div key={idx} style={{ 
                  padding: "6px 12px", 
                  marginBottom: 6, 
                  borderRadius: 6,
                  background: hint.type === "success" ? "#ECFDF5" : "#FFFBEB",
                  borderLeft: `3px solid ${hint.type === "success" ? "#059669" : "#D97706"}`,
                  fontSize: "0.75rem"
                }}>
                  {hint.message}
                </div>
              ))}
            </div>
          )}

          <button 
            className="btn btn-primary btn-full" 
            onClick={handleSubmit} 
            disabled={loading || !answer.trim()}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {loading ? "Evaluating..." : "Submit Answer"}
            {!loading && <FiArrowRight size={16} />}
          </button>
        </>
      )}

      {/* Evaluation Feedback */}
      {evaluation && (
        <div style={{ marginTop: 24, padding: 20, background: "#F8F9FC", borderRadius: 12 }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#4F46E5" }}>{evaluation.scores?.overall || 0}</div>
              <div style={{ fontSize: 11, color: "#6B7080" }}>Overall</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>{evaluation.scores?.technical || 0}</div>
              <div style={{ fontSize: 11, color: "#6B7080" }}>Technical</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>{evaluation.scores?.depth || 0}</div>
              <div style={{ fontSize: 11, color: "#6B7080" }}>Depth</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>{evaluation.scores?.clarity || 0}</div>
              <div style={{ fontSize: 11, color: "#6B7080" }}>Clarity</div>
            </div>
          </div>
          
          <div style={{ marginBottom: 12, padding: 12, background: "#EEF2FF", borderRadius: 8 }}>
            <strong>Feedback:</strong>
            <p style={{ margin: "8px 0 0", fontSize: "0.85rem" }}>{evaluation.feedback?.improved_answer || "Good attempt!"}</p>
          </div>
        </div>
      )}

      {/* Next Button */}
      {showNext && (
        <button 
          className="btn btn-primary btn-full" 
          onClick={handleNextWithTransition}
          style={{ marginTop: 20 }}
        >
          Next Question →
        </button>
      )}
    </div>
  );
}