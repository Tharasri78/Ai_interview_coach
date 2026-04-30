import { useState, useEffect } from "react";
import { getHistory } from "../api/apiService";
import { 
  FiChevronRight, 
  FiChevronDown,
  FiCalendar,
  FiMessageSquare,
  FiHelpCircle
} from "react-icons/fi";

export default function HistoryPanel({ userId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getHistory(userId);
      console.log("History data:", res.data);
      setHistory(res.data || []);
    } catch (err) {
      console.error("History error:", err);
      setHistory([]);
    }
    setLoading(false);
  };

  const filteredHistory = history.filter(item => {
    if (filter === "strong") return item.score >= 7;
    if (filter === "weak") return item.score < 5;
    return true;
  });

  const getScoreColor = (score) => {
    if (score >= 8) return { bg: "#ECFDF5", text: "#059669", label: "Excellent" };
    if (score >= 6) return { bg: "#EEF2FF", text: "#4F46E5", label: "Good" };
    if (score >= 4) return { bg: "#FFFBEB", text: "#D97706", label: "Average" };
    return { bg: "#FEF2F2", text: "#DC2626", label: "Needs Work" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // If date is invalid, return "Just now"
    if (isNaN(date.getTime())) return "Just now";
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
};

  const StatsCard = () => {
    const totalQuestions = history.length;
    const avgScore = totalQuestions > 0 
      ? (history.reduce((sum, h) => sum + (h.score || 0), 0) / totalQuestions).toFixed(1)
      : 0;
    const strongCount = history.filter(h => h.score >= 7).length;
    const weakCount = history.filter(h => h.score < 5).length;

    return (
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: "16px", 
        marginBottom: "24px" 
      }}>
        <div style={{ 
          background: "white", 
          padding: "16px", 
          borderRadius: "12px", 
          textAlign: "center",
          border: "1px solid #E8E9EF"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#4F46E5" }}>{totalQuestions}</div>
          <div style={{ fontSize: "12px", color: "#6B7080" }}>Total Questions</div>
        </div>
        <div style={{ 
          background: "white", 
          padding: "16px", 
          borderRadius: "12px", 
          textAlign: "center",
          border: "1px solid #E8E9EF"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#059669" }}>{avgScore}</div>
          <div style={{ fontSize: "12px", color: "#6B7080" }}>Average Score</div>
        </div>
        <div style={{ 
          background: "white", 
          padding: "16px", 
          borderRadius: "12px", 
          textAlign: "center",
          border: "1px solid #E8E9EF"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#4F46E5" }}>{strongCount}/{weakCount}</div>
          <div style={{ fontSize: "12px", color: "#6B7080" }}>Strong/Weak</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading-bar"><div className="loading-bar-fill" /></div>
        <div className="msg msg-info">Loading history...</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="card">
        <div style={{ textAlign: "center", padding: "48px 24px" }}>
          <h3>No Interview History</h3>
          <p style={{ color: "#6B7080", marginBottom: "20px" }}>Complete a practice session to see your history here.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Start Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StatsCard />

      {/* Filter Buttons */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button 
          onClick={() => setFilter("all")}
          style={{ 
            padding: "6px 16px", 
            borderRadius: "20px", 
            border: "1px solid #E8E9EF",
            background: filter === "all" ? "#4F46E5" : "white",
            color: filter === "all" ? "white" : "#6B7080",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          All Questions
        </button>
        <button 
          onClick={() => setFilter("strong")}
          style={{ 
            padding: "6px 16px", 
            borderRadius: "20px", 
            border: "1px solid #E8E9EF",
            background: filter === "strong" ? "#059669" : "white",
            color: filter === "strong" ? "white" : "#6B7080",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          Strong (≥7)
        </button>
        <button 
          onClick={() => setFilter("weak")}
          style={{ 
            padding: "6px 16px", 
            borderRadius: "20px", 
            border: "1px solid #E8E9EF",
            background: filter === "weak" ? "#DC2626" : "white",
            color: filter === "weak" ? "white" : "#6B7080",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          Weak (&lt;5)
        </button>
      </div>

      {/* History List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredHistory.map((item, idx) => {
          const scoreColor = getScoreColor(item.score);
          const isExpanded = expandedId === idx;
          
          return (
            <div 
              key={idx} 
              style={{ 
                background: "white", 
                border: "1px solid #E8E9EF", 
                borderRadius: "12px",
                overflow: "hidden"
              }}
            >
              {/* Header - Click to expand */}
              <div 
                onClick={() => setExpandedId(isExpanded ? null : idx)}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "16px", 
                  padding: "16px",
                  cursor: "pointer",
                  borderBottom: isExpanded ? "1px solid #E8E9EF" : "none"
                }}
              >
                {/* Score Badge */}
                <div style={{ 
                  minWidth: "75px", 
                  padding: "8px 12px", 
                  borderRadius: "10px", 
                  textAlign: "center",
                  background: scoreColor.bg
                }}>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: scoreColor.text }}>{item.score?.toFixed(1) || "—"}</div>
                  <div style={{ fontSize: "10px", color: scoreColor.text }}>{scoreColor.label}</div>
                </div>
                
                {/* Question Preview */}
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 500, 
                    marginBottom: "6px",
                    fontSize: "14px",
                    color: "#0F1117",
                    lineHeight: 1.4
                  }}>
                    {item.question?.slice(0, 100)}...
                  </div>
                  <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: "#6B7080" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <FiCalendar size={11} /> {formatDate(item.created_at)}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <FiMessageSquare size={11} /> Answer length: {item.answer?.length || 0} chars
                    </span>
                  </div>
                </div>
                
                {/* Expand Icon */}
                <div style={{ color: "#9EA4B5" }}>
                  {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                </div>
              </div>
              
              {/* Expanded Content - Shows full question and answer */}
              {isExpanded && (
                <div style={{ padding: "16px", background: "#F8F9FC" }}>
                  {/* Full Question */}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "6px", 
                      marginBottom: "8px",
                      color: "#4F46E5",
                      fontSize: "12px",
                      fontWeight: 600
                    }}>
                      <FiHelpCircle size={14} /> QUESTION ASKED
                    </div>
                    <div style={{ 
                      padding: "12px", 
                      background: "white", 
                      borderRadius: "8px",
                      fontSize: "14px",
                      lineHeight: 1.5,
                      color: "#0F1117"
                    }}>
                      {item.question || "Question not available"}
                    </div>
                  </div>
                  
                  {/* User's Answer */}
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "6px", 
                      marginBottom: "8px",
                      color: "#6B7080",
                      fontSize: "12px",
                      fontWeight: 600
                    }}>
                      <FiMessageSquare size={14} /> YOUR ANSWER
                    </div>
                    <div style={{ 
                      padding: "12px", 
                      background: "white", 
                      borderRadius: "8px",
                      fontSize: "14px",
                      lineHeight: 1.5,
                      color: "#0F1117"
                    }}>
                      {item.answer || "Answer not available"}
                    </div>
                  </div>
                  
                  {/* Feedback if available */}
                  {item.feedback && (
                    <div style={{ 
                      padding: "12px", 
                      background: "#EEF2FF", 
                      borderRadius: "8px",
                      marginTop: "8px"
                    }}>
                      <strong style={{ fontSize: "12px", color: "#4F46E5" }}>Feedback:</strong>
                      <p style={{ marginTop: "6px", fontSize: "13px", lineHeight: 1.5 }}>{item.feedback}</p>
                    </div>
                  )}
                  
                  {/* Score breakdown if available */}
                  {(item.technical || item.depth || item.clarity) && (
                    <div style={{ 
                      display: "flex", 
                      gap: "12px", 
                      marginTop: "12px",
                      padding: "10px",
                      background: "white",
                      borderRadius: "8px"
                    }}>
                      {item.technical && <span><strong>Tech:</strong> {item.technical}/10</span>}
                      {item.depth && <span><strong>Depth:</strong> {item.depth}/10</span>}
                      {item.clarity && <span><strong>Clarity:</strong> {item.clarity}/10</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}