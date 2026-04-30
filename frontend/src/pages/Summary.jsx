import { useEffect, useState } from "react";
import "./Summary.css";
import { getSummary } from "../api/apiService";
import { useNavigate } from "react-router-dom";
import { FaChartBar, FaChartLine, FaBullseye, FaSignOutAlt, FaTachometerAlt, FaStar, FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Summary() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const userId = Number(localStorage.getItem("user_id"));
  const userName = localStorage.getItem("user_name") || "User";

  useEffect(() => {
    if (!userId) navigate("/");
  }, [userId, navigate]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await getSummary(userId);
      setSummary(res.data || null);
    } catch (err) {
      console.error("Summary error:", err);
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navItems = [
    { icon: <FaBullseye />, label: "Practice", key: "practice", path: "/dashboard" },
    { icon: <FaChartBar />, label: "History", key: "history", path: "/dashboard?tab=history" },
    { icon: <FaChartLine />, label: "Summary", key: "summary", path: "/summary" },
  ];

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate("/")}>
          <span className="sidebar-logo-dot" />
          Prepply
        </div>

        <div className="sidebar-section-label">Main</div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <motion.div
              key={item.key}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              className={`sidebar-item ${item.key === "summary" ? "active" : ""}`}
              onClick={() => {
                if (item.key === "summary") {
                  navigate("/summary");
                } else if (item.key === "history") {
                  navigate("/dashboard?tab=history");
                } else {
                  navigate("/dashboard");
                }
              }}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              {item.label}
            </motion.div>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{userName[0]?.toUpperCase()}</div>
          <div>
            <div className="user-name">{userName}</div>
            <div className="user-role">
              <span className="user-role-dot" /> Candidate
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn btn-outline btn-full"
          style={{ marginTop: 12 }}
          onClick={handleLogout}
        >
          <FaSignOutAlt /> Logout
        </motion.button>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* MOBILE TOPBAR */}
        <div className="mobile-topbar">
          <div className="mobile-topbar-logo">
            <span className="mobile-topbar-logo-dot" /> Prepply
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 500 }}>
            Summary
          </div>
          <button 
            className="mobile-menu-btn"
            onClick={() => {
              const sidebar = document.querySelector('.sidebar');
              sidebar?.classList.toggle('mobile-open');
            }}
          >
            ☰
          </button>
        </div>

        <main className="dashboard-main">
          {/* HEADER */}
          <div className="page-header">
            <h1 className="page-title">Performance Summary</h1>
            <p className="page-subtitle">Track your interview performance and improvement over time.</p>
          </div>

          {/* LOADING STATE */}
          {summaryLoading && (
            <div className="loading-bar">
              <div className="loading-bar-fill" />
            </div>
          )}

          {/* NO DATA STATE */}
          {!summaryLoading && (!summary || summary.total === 0) && (
            <div className="card">
              <div className="msg msg-info">
                 No data available yet. Complete a practice session to see your performance summary.
              </div>
              <button
                className="btn btn-primary btn-full"
                style={{ marginTop: 20 }}
                onClick={() => navigate("/dashboard")}
              >
                Start Practicing
              </button>
            </div>
          )}

          {/* SUMMARY CONTENT */}
          {summary && summary.total > 0 && (
            <>
              {/* Row 1: Overall Score */}
              <div className="summary-card">
                <div className="overall-score-wrapper">
                  <div className="score-ring" style={{
                    background: `conic-gradient(#4F46E5 ${(summary.avg_score / 10) * 360}deg, #E8E9EF 0deg)`
                  }}>
                    <div className="score-ring-inner">
                      <span className="score-number">{summary.avg_score ? summary.avg_score.toFixed(1) : "0"}</span>
                      <span className="score-total">/10</span>
                    </div>
                  </div>
                  <div className="overall-stats">
                    <h2 className="overall-title">Overall Performance</h2>
                    <p className="overall-attempts">{summary.total} total answers</p>
                    <div className="overall-level">
                      {summary.avg_score >= 7 ? "🎯 Advanced" : summary.avg_score >= 5 ? "📈 Intermediate" : "🌱 Beginner"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Skill Breakdown */}
              <div className="summary-card">
                <div className="card-header">
                  <div className="card-title-group">
                    <div className="card-icon blue">
                      <FaTachometerAlt />
                    </div>
                    <div>
                      <div className="card-title">Skill Breakdown</div>
                      <div className="card-sub">Performance across key dimensions</div>
                    </div>
                  </div>
                </div>

                <div className="skills-container">
                  <div className="skill-item">
                    <div className="skill-header">
                      <span className="skill-label">Technical Accuracy</span>
                      <span className="skill-score">{summary.breakdown?.technical?.toFixed(1) || 0}/10</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill technical"
                        style={{ width: `${((summary.breakdown?.technical || 0) / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="skill-item">
                    <div className="skill-header">
                      <span className="skill-label">Depth of Knowledge</span>
                      <span className="skill-score">{summary.breakdown?.depth?.toFixed(1) || 0}/10</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill depth"
                        style={{ width: `${((summary.breakdown?.depth || 0) / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="skill-item">
                    <div className="skill-header">
                      <span className="skill-label">Clarity & Structure</span>
                      <span className="skill-score">{summary.breakdown?.clarity?.toFixed(1) || 0}/10</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill clarity"
                        style={{ width: `${((summary.breakdown?.clarity || 0) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Strong & Weak Areas */}
              <div className="summary-card">
                <div className="card-header">
                  <div className="card-title-group">
                    <div className="card-icon purple">
                      <FaChartLine />
                    </div>
                    <div>
                      <div className="card-title">Areas Analysis</div>
                      <div className="card-sub">Your strengths and improvement areas</div>
                    </div>
                  </div>
                </div>

                <div className="areas-grid">
                  <div className="area-box strong">
                    <div className="area-icon">
                      <FaStar />
                    </div>
                    <div className="area-info">
                      <div className="area-label">Strongest Area</div>
                      <div className="area-name">{summary.strong || "N/A"}</div>
                      <div className="area-message">Keep building on this strength</div>
                    </div>
                  </div>

                  <div className="area-box weak">
                    <div className="area-icon">
                      <FaExclamationTriangle />
                    </div>
                    <div className="area-info">
                      <div className="area-label">Area to Improve</div>
                      <div className="area-name">{summary.weak || "N/A"}</div>
                      <div className="area-message">Focus your practice here</div>
                    </div>
                  </div>
                </div>

                {(summary.suggestions || []).length > 0 && (
                  <div className="recommendations-box">
                    <div className="recommendations-title"> Recommendations</div>
                    {summary.suggestions.map((tip, index) => (
                      <div key={index} className="recommendation-item">
                        <span className="bullet">→</span> {tip}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 4: Quick Action */}
              <div className="summary-card quick-action">
                <div className="quick-action-wrapper">
                  <div>
                    <h3>Ready to improve your scores?</h3>
                    <p>Continue practicing to track your progress and level up.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
                    Start Practice →
                  </button>
                </div>
              </div>
            </>
          )}
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <div className="mobile-bottom-nav">
          <div className="mobile-bottom-nav-inner">
            {navItems.map((item) => (
              <div
                key={item.key}
                className={`mobile-nav-item ${item.key === "summary" ? "active" : ""}`}
                onClick={() => {
                  if (item.key === "summary") {
                    navigate("/summary");
                  } else if (item.key === "history") {
                    navigate("/dashboard?tab=history");
                  } else {
                    navigate("/dashboard");
                  }
                }}
              >
                <span className="mobile-nav-item-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}