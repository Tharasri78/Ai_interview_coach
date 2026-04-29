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
  FiInfo,
  FiBarChart2
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
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const [timerActive, setTimerActive] = useState(true);

  // Round configuration
  const roundConfig = {
    1: { 
      name: "HR Round", 
      icon: <FiMessageSquare size={16} />, 
      description: "Behavioral & Cultural Fit",
      questionsRange: "Questions 1-2"
    },
    2: { 
      name: "Technical Round", 
      icon: <FiCode size={16} />, 
      description: "Core Concepts & Skills",
      questionsRange: "Questions 3-4"
    },
    3: { 
      name: "Deep Dive", 
      icon: <FiCpu size={16} />, 
      description: "System Design & Problem Solving",
      questionsRange: "Questions 5-6"
    }
  };

  // Timer effect
  useEffect(() => {
    if (timerActive && !showNext && !finished && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timerActive, showNext, finished, timeLeft]);

  // Reset timer for new question
  useEffect(() => {
    setTimeLeft(120);
    setTimerActive(true);
  }, [question]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Real-time answer quality analysis
  const analyzeAnswerQuality = (text) => {
    const hints = [];
    
    // Length analysis
    if (text.length === 0) {
      hints.push({ type: "info", message: "Start typing your answer..." });
    } else if (text.length < 50) {
      hints.push({ type: "warning", message: "Increase depth - Add specific details and examples" });
    } else if (text.length < 150) {
      hints.push({ type: "info", message: "Good start - Consider adding more technical depth" });
    } else if (text.length >= 150 && text.length <= 500) {
      hints.push({ type: "success", message: "Optimal length - Well structured response" });
    } else {
      hints.push({ type: "warning", message: "Consider being more concise - Focus on key points" });
    }
    
    // STAR method detection
    const starKeywords = ["situation", "task", "action", "result", "context", "goal", "outcome", "learned", "implemented", "designed", "built", "created", "led", "managed"];
    const found = starKeywords.filter(kw => text.toLowerCase().includes(kw));
    
    if (found.length < 3) {
      hints.push({ type: "warning", message: "Use STAR framework: Situation, Task, Action, Result" });
    } else if (found.length >= 3 && found.length < 5) {
      hints.push({ type: "success", message: "Good structure - Continue using STAR method" });
    } else {
      hints.push({ type: "success", message: "Excellent structure - Clear and well-organized" });
    }
    
    // Technical depth
    const techKeywords = ["because", "however", "therefore", "implemented", "designed", "optimized", "architecture", "database", "api", "system", "performance", "scalability"];
    const techFound = techKeywords.filter(kw => text.toLowerCase().includes(kw));
    
    if (techFound.length === 0 && text.length > 50) {
      hints.push({ type: "warning", message: "Add technical reasoning - Explain WHY and HOW" });
    } else if (techFound.length >= 2) {
      hints.push({ type: "success", message: "Strong technical depth - Good analytical thinking" });
    }
    
    setAnswerHints(hints);
  };

  const handleAnswerChange = (e) => {
    const text = e.target.value;
    setAnswer(text);
    analyzeAnswerQuality(text);
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setLoading(true);
    setTimerActive(false);

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

  if (finished) {
    const currentRoundData = roundConfig[round] || roundConfig[1];
    const overallScore = summary?.avg_score || 0;
    const scoreLevel = overallScore >= 7 ? "Advanced" : overallScore >= 5 ? "Intermediate" : "Foundation";
    
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon green">
              <FiCheck size={20} />
            </div>
            <div>
              <div className="card-title">Assessment Complete</div>
              <div className="card-sub">Performance Summary Report</div>
            </div>
          </div>
        </div>

        <div className="overall-score-wrapper" style={{ marginTop: 20 }}>
          <div className="score-ring" style={{
            background: `conic-gradient(#4F46E5 ${(overallScore / 10) * 360}deg, #E8E9EF 0deg)`
          }}>
            <div className="score-ring-inner">
              <span className="score-number">{overallScore.toFixed(1)}</span>
              <span className="score-total">/10</span>
            </div>
          </div>
          <div className="overall-stats">
            <h2 className="overall-title">Overall Performance</h2>
            <p className="overall-attempts">{summary?.total || 0} questions answered</p>
            <div className="overall-level">{scoreLevel}</div>
          </div>
        </div>

        <div className="areas-grid" style={{ marginTop: 24, marginBottom: 24 }}>
          <div className="area-box strong">
            <div className="area-icon">
              <FiCheckCircle size={18} />
            </div>
            <div className="area-info">
              <div className="area-label">Strength Area</div>
              <div className="area-name">{summary?.strong?.substring(0, 60)}...</div>
              <div className="area-message">Continue building on this competency</div>
            </div>
          </div>

          <div className="area-box weak">
            <div className="area-icon">
              <FiAlertCircle size={18} />
            </div>
            <div className="area-info">
              <div className="area-label">Development Area</div>
              <div className="area-name">{summary?.weak?.substring(0, 60)}...</div>
              <div className="area-message">Focus practice on this topic</div>
            </div>
          </div>
        </div>

        {(summary?.suggestions || []).length > 0 && (
          <div className="recommendations-box">
            <div className="recommendations-title">Development Recommendations</div>
            {summary.suggestions.map((tip, idx) => (
              <div key={idx} className="recommendation-item">
                <span className="bullet">→</span> {tip}
              </div>
            ))}
          </div>
        )}

        <button 
          className="btn btn-primary btn-full" 
          style={{ marginTop: 24 }}
          onClick={() => window.location.reload()}
        >
          Start New Session
        </button>
      </div>
    );
  }

  const progressPercent = ((index - 1) / total) * 100;
  const currentRoundData = roundConfig[round] || roundConfig[1];
  const isWarning = timeLeft <= 30;
  const isCritical = timeLeft <= 10;

  return (
    <div className="card">
      {/* Progress Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 6,
              padding: "4px 12px",
              background: "#EEF2FF",
              borderRadius: 20,
              color: "#4F46E5"
            }}>
              {currentRoundData.icon}
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{currentRoundData.name}</span>
            </div>
            <span style={{ fontSize: "0.85rem", color: "#6B7080" }}>
              Question {index} of {total}
            </span>
          </div>
          
          {/* Timer */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 6,
            padding: "4px 12px",
            background: isCritical ? "#FEF2F2" : isWarning ? "#FFFBEB" : "#F3F4F6",
            borderRadius: 20,
            color: isCritical ? "#DC2626" : isWarning ? "#D97706" : "#6B7080",
            fontWeight: 600
          }}>
            <FiInfo size={14} />
            <span style={{ fontSize: "0.8rem" }}>{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div style={{ 
          height: 6, 
          background: "#E8E9EF", 
          borderRadius: 3, 
          overflow: "hidden" 
        }}>
          <div style={{ 
            width: `${progressPercent}%`, 
            height: "100%", 
            background: "linear-gradient(90deg, #4F46E5, #7C3AED)",
            borderRadius: 3,
            transition: "width 0.3s ease"
          }} />
        </div>
        
        {/* Round Indicators */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          marginTop: 12,
          fontSize: "0.7rem",
          color: "#6B7080"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <FiMessageSquare size={12} />
            <span>HR Round</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <FiCode size={12} />
            <span>Technical</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <FiCpu size={12} />
            <span>Deep Dive</span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="question-box" style={{ 
        background: "#F8F9FC", 
        padding: 24, 
        borderRadius: 12,
        marginBottom: 24,
        borderLeft: "4px solid #4F46E5"
      }}>
        <div style={{ 
          fontSize: "0.7rem", 
          color: "#4F46E5", 
          marginBottom: 10,
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontWeight: 600
        }}>
          Interview Question
        </div>
        <div className="question-text" style={{ 
          fontSize: "1rem", 
          lineHeight: 1.6, 
          color: "#0F1117",
          fontWeight: 500
        }}>
          {question}
        </div>
      </div>

      {/* Answer Section */}
      <div style={{ marginBottom: 20 }}>
        <label className="field-label">Your Response</label>
        <textarea
          className="textarea-input"
          value={answer}
          onChange={handleAnswerChange}
          disabled={showNext}
          placeholder="Structure your answer using the STAR method: Situation, Task, Action, Result..."
          rows={6}
          style={{ fontSize: "0.9rem", lineHeight: 1.6 }}
        />
      </div>

      {/* Live Answer Quality Analysis */}
      {answerHints.length > 0 && !showNext && answer.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {answerHints.map((hint, idx) => (
            <div key={idx} style={{ 
              padding: "8px 12px", 
              marginBottom: 8, 
              borderRadius: 8,
              background: hint.type === "success" ? "#ECFDF5" : hint.type === "warning" ? "#FFFBEB" : "#EEF2FF",
              borderLeft: `3px solid ${hint.type === "success" ? "#059669" : hint.type === "warning" ? "#D97706" : "#4F46E5"}`,
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              {hint.type === "success" && <FiCheckCircle size={14} color="#059669" />}
              {hint.type === "warning" && <FiAlertCircle size={14} color="#D97706" />}
              {hint.type === "info" && <FiInfo size={14} color="#4F46E5" />}
              <span style={{ color: hint.type === "success" ? "#059669" : hint.type === "warning" ? "#92400E" : "#1E40AF" }}>
                {hint.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      {!showNext && (
        <button 
          className="btn btn-primary btn-full" 
          onClick={handleSubmit} 
          disabled={loading || !answer.trim()}
          style={{ 
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          {loading ? "Evaluating Response..." : "Submit Response"}
          {!loading && <FiArrowRight size={16} />}
        </button>
      )}

      {/* Evaluation Feedback */}
      {evaluation && (
        <div style={{ marginTop: 24 }}>
          <div style={{ 
            padding: 20, 
            background: "#F8F9FC", 
            borderRadius: 12,
            border: "1px solid #E8E9EF"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ 
                width: 70, 
                height: 70, 
                borderRadius: "50%", 
                background: `conic-gradient(#4F46E5 ${evaluation.scores.overall * 36}deg, #E8E9EF 0deg)`,
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <div style={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: "50%", 
                  background: "white", 
                  display: "flex", 
                  flexDirection: "column",
                  alignItems: "center", 
                  justifyContent: "center",
                  fontWeight: "bold"
                }}>
                  <span style={{ fontSize: "1.2rem" }}>{evaluation.scores.overall}</span>
                  <span style={{ fontSize: "0.6rem", color: "#6B7080" }}>/10</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.8rem", color: "#6B7080" }}>Technical</span>
                  <span style={{ fontWeight: 600 }}>{evaluation.scores.technical}/10</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.8rem", color: "#6B7080" }}>Depth</span>
                  <span style={{ fontWeight: 600 }}>{evaluation.scores.depth}/10</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.8rem", color: "#6B7080" }}>Clarity</span>
                  <span style={{ fontWeight: 600 }}>{evaluation.scores.clarity}/10</span>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#DC2626", marginBottom: 6 }}>Issues Identified</div>
              <p style={{ fontSize: "0.85rem", color: "#0F1117" }}>{evaluation.feedback.issues}</p>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#D97706", marginBottom: 6 }}>Missing Elements</div>
              <p style={{ fontSize: "0.85rem", color: "#0F1117" }}>{evaluation.feedback.missing}</p>
            </div>
            
            <div style={{ 
              padding: 12, 
              background: "#EEF2FF", 
              borderRadius: 8,
              marginBottom: 16
            }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#4F46E5", marginBottom: 6 }}>Model Response</div>
              <p style={{ fontSize: "0.85rem", color: "#0F1117", lineHeight: 1.5 }}>{evaluation.feedback.improved_answer}</p>
            </div>
          </div>
        </div>
      )}

      {/* Next Button */}
      {showNext && (
        <button 
          className="btn btn-primary btn-full" 
          onClick={() => {
            onNext(nextData);
            setAnswer("");
            setShowNext(false);
            setEvaluation(null);
            setAnswerHints([]);
            setTimerActive(true);
          }}
          style={{ 
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          Continue to Next Question
          <FiArrowRight size={16} />
        </button>
      )}
    </div>
  );
}