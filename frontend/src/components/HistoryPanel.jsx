import { useState, useEffect } from "react";
import { getHistory } from "../api/apiService";
import { 
  FiClock, 
  FiChevronRight, 
  FiChevronDown,
  FiStar,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiMessageSquare,
  FiCheckCircle,
  FiAlertCircle,
  FiBarChart2
} from "react-icons/fi";

export default function HistoryPanel({ userId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all"); // all, strong, weak
  const [sortBy, setSortBy] = useState("date"); // date, score

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getHistory(userId);
      setHistory(res.data || []);
    } catch (err) {
      console.error("History error:", err);
    }
    setLoading(false);
  };

  // Filter and sort history
  const filteredHistory = history
    .filter(item => {
      if (filter === "strong") return item.score >= 7;
      if (filter === "weak") return item.score < 5;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const getScoreColor = (score) => {
    if (score >= 8) return { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" };
    if (score >= 6) return { bg: "#EEF2FF", text: "#4F46E5", border: "#C7D2FE" };
    if (score >= 4) return { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" };
    return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" };
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Average";
    return "Needs Work";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

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
    const improvement = history.length >= 2 
      ? (history[0]?.score - history[history.length - 1]?.score).toFixed(1)
      : 0;

    return (
      <div className="history-stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><FiBarChart2 size={20} /></div>
          <div className="stat-value">{totalQuestions}</div>
          <div className="stat-label">Total Questions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><FiStar size={20} /></div>
          <div className="stat-value">{avgScore}/10</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiTrendingUp size={20} /></div>
          <div className="stat-value">{strongCount}</div>
          <div className="stat-label">Strong Answers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><FiTrendingDown size={20} /></div>
          <div className="stat-value">{weakCount}</div>
          <div className="stat-label">Needs Practice</div>
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
        <div className="empty-state">
          <div className="empty-icon"><FiClock size={48} /></div>
          <h3>No Interview History</h3>
          <p>Complete a practice session to see your performance history here.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Start Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      {/* Stats Summary */}
      <StatsCard />

      {/* Filter Bar */}
      <div className="history-filter-bar">
        <div className="filter-group">
          <button 
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Questions
          </button>
          <button 
            className={`filter-btn ${filter === "strong" ? "active" : ""}`}
            onClick={() => setFilter("strong")}
          >
            Strong (≥7)
          </button>
          <button 
            className={`filter-btn ${filter === "weak" ? "active" : ""}`}
            onClick={() => setFilter("weak")}
          >
            Weak (&lt;5)
          </button>
        </div>
        <div className="sort-group">
          <button 
            className={`sort-btn ${sortBy === "date" ? "active" : ""}`}
            onClick={() => setSortBy("date")}
          >
            Latest First
          </button>
          <button 
            className={`sort-btn ${sortBy === "score" ? "active" : ""}`}
            onClick={() => setSortBy("score")}
          >
            Highest Score
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="history-list-enhanced">
        {filteredHistory.map((item, idx) => {
          const scoreColor = getScoreColor(item.score);
          const isExpanded = expandedId === idx;
          
          return (
            <div 
              key={idx} 
              className={`history-item-enhanced ${isExpanded ? "expanded" : ""}`}
              style={{ borderLeftColor: scoreColor.border }}
            >
              <div 
                className="history-item-header"
                onClick={() => setExpandedId(isExpanded ? null : idx)}
              >
                <div className="history-score-badge" style={{ background: scoreColor.bg }}>
                  <span className="score-value" style={{ color: scoreColor.text }}>
                    {item.score?.toFixed(1) || "—"}
                  </span>
                  <span className="score-label" style={{ color: scoreColor.text }}>
                    {getScoreLabel(item.score)}
                  </span>
                </div>
                
                <div className="history-question-preview">
                  <div className="question-text">{item.question}</div>
                  <div className="question-meta">
                    <span className="meta-item">
                      <FiCalendar size={12} />
                      {formatDate(item.created_at)}
                    </span>
                    {item.technical && (
                      <span className="meta-item">
                        <FiBarChart2 size={12} />
                        Tech: {item.technical}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="expand-icon">
                  {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                </div>
              </div>
              
              {isExpanded && (
                <div className="history-item-details">
                  <div className="detail-section">
                    <div className="detail-title">
                      <FiMessageSquare size={14} />
                      Your Answer
                    </div>
                    <div className="detail-content">{item.answer}</div>
                  </div>
                  
                  {item.feedback && (
                    <>
                      <div className="detail-section">
                        <div className="detail-title">
                          <FiCheckCircle size={14} color="#059669" />
                          Strengths
                        </div>
                        <div className="detail-content">{item.feedback.strengths || "Good effort on this answer"}</div>
                      </div>
                      
                      <div className="detail-section warning">
                        <div className="detail-title">
                          <FiAlertCircle size={14} color="#D97706" />
                          Areas for Improvement
                        </div>
                        <div className="detail-content">{item.feedback.improvements || "Add more specific examples"}</div>
                      </div>
                    </>
                  )}
                  
                  {item.technical && (
                    <div className="score-breakdown">
                      <div className="score-breakdown-item">
                        <span>Technical</span>
                        <div className="progress-bar-mini">
                          <div className="progress-fill" style={{ width: `${(item.technical / 10) * 100}%` }} />
                        </div>
                        <span>{item.technical}/10</span>
                      </div>
                      <div className="score-breakdown-item">
                        <span>Depth</span>
                        <div className="progress-bar-mini">
                          <div className="progress-fill" style={{ width: `${(item.depth / 10) * 100}%` }} />
                        </div>
                        <span>{item.depth}/10</span>
                      </div>
                      <div className="score-breakdown-item">
                        <span>Clarity</span>
                        <div className="progress-bar-mini">
                          <div className="progress-fill" style={{ width: `${(item.clarity / 10) * 100}%` }} />
                        </div>
                        <span>{item.clarity}/10</span>
                      </div>
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