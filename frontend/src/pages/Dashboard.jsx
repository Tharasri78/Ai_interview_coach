import { useState, useEffect } from "react";
import "./Dashboard.css";
import Upload from "../components/Upload";
import Question from "../components/Question";
import Answer from "../components/Answer";
import { getHistory } from "../api/apiService";
import { useNavigate } from "react-router-dom";
import { FaBullseye, FaChartBar, FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("practice");
  const [isUploaded, setIsUploaded] = useState(false);
  const [questionData, setQuestionData] = useState(null);
  const [history, setHistory] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const userId = Number(localStorage.getItem("user_id")) || 1;
  const userName = localStorage.getItem("user_name") || "User";

  useEffect(() => {
    if (tab === "history") fetchHistory();
  }, [tab]);
  useEffect(() => {
  if (tab === "practice") {
    setIsUploaded(false);
    setQuestionData(null);
  }
}, [tab]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await getHistory(userId);
      setHistory(res.data || []);
    } catch {
      setHistory([]);
    }
    setHistoryLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const step = !isUploaded ? 1 : !questionData ? 2 : 3;

  // ✅ FIXED icons (NO emojis)
  const navItems = [
    { icon: <FaBullseye />, label: "Practice", key: "practice" },
    { icon: <FaChartBar />, label: "History", key: "history" },
  ];

  const FeedbackTag = ({ score }) => {
    if (score >= 8) return <span className="feedback-tag feedback-strong">Strong</span>;
    if (score >= 5) return <span className="feedback-tag feedback-average">Average</span>;
    return <span className="feedback-tag feedback-weak">Weak</span>;
  };

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
              className={`sidebar-item ${tab === item.key ? "active" : ""}`}
              onClick={() => setTab(item.key)}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              {item.label}
              {item.key === "history" && history.length > 0 && (
                <span className="sidebar-item-badge">{history.length}</span>
              )}
            </motion.div>
          ))}
        </nav>

        {/* USER */}
        <div className="sidebar-user">
          <div className="user-avatar">{userName[0]?.toUpperCase()}</div>
          <div>
            <div className="user-name">{userName}</div>
          </div>
        </div>

        {/* ✅ LOGOUT BUTTON ADDED */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-outline btn-full"
          style={{ marginTop: 12 }}
          onClick={handleLogout}
        >
          <FaSignOutAlt /> Logout
        </motion.button>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        <div className="mobile-topbar">
          <div className="mobile-topbar-logo">
            <span className="mobile-topbar-logo-dot" /> Prepply
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 500 }}>
            {navItems.find(n => n.key === tab)?.label}
          </div>
          <div style={{ width: 32 }} />
        </div>

        <main className="dashboard-main">

          {/* PRACTICE */}
          {tab === "practice" && (
            <>
              <div className="page-header">
                <h1 className="page-title">Practice Session</h1>
                <p className="page-subtitle">Complete each step in order to begin.</p>
              </div>

              <div className="flow-steps">
                {[{ n: 1, label: "Upload PDF" }, { n: 2, label: "Generate Question" }, { n: 3, label: "Submit Answer" }].map((s, i) => (
                  <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className={`flow-step ${step === s.n ? "active" : step > s.n ? "done" : ""}`}>
                      <div className="flow-step-num">{step > s.n ? "✓" : s.n}</div>
                      {s.label}
                    </div>
                    {i < 2 && <span className="flow-arrow">›</span>}
                  </div>
                ))}
              </div>

              <div className="dashboard-grid">
                <Upload
                  userId={userId}
                  onUploaded={(status) => {
                    setIsUploaded(status);
                    if (!status) setQuestionData(null);
                  }}
                />

                <Question
                  userId={userId}
                  disabled={!isUploaded}
                  onQuestion={(data) => setQuestionData(data)}
                />
              </div>

              <div style={{ marginTop: 20 }}>
                <Answer
                  userId={userId}
                  questionData={questionData}
                  disabled={!questionData}
                  onAnswered={fetchHistory}
                />
              </div>
            </>
          )}

          {/* HISTORY */}
          {tab === "history" && (
            <>
              <div className="page-header">
                <h1 className="page-title">Session History</h1>
                <p className="page-subtitle">Your past questions and performance breakdown.</p>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title-group">
                    <div className="card-icon blue"><FaChartBar /></div>
                    <div>
                      <div className="card-title">Past Attempts</div>
                      <div className="card-sub">{history.length} sessions recorded</div>
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={fetchHistory}>↻ Refresh</button>
                </div>

                {historyLoading && <div className="loading-bar"><div className="loading-bar-fill" /></div>}

                {!historyLoading && history.length === 0 && (
                  <div className="msg msg-info">No history yet. Complete a practice session first.</div>
                )}

                <div className="history-list">
                  {history.map((h, i) => (
                    <div className="history-item" key={i} onClick={() => setOpenIndex(i === openIndex ? null : i)}>
                      <div className={`history-score ${h.overall >= 8 ? "score-hi" : h.overall >= 5 ? "score-mid" : "score-lo"}`}>
                      {typeof h.overall === "number" ? h.overall.toFixed(1) : "—"}
                      </div>
                      <div className="history-content">
                        <div className="history-question">
                          {h.question}
                          <FeedbackTag score={h.overall} />
                        </div>
                        {openIndex === i && (
                          <div className="history-details">
                            <strong>Answer:</strong> {h.answer}
                          </div>
                        )}
                        <div className="history-breakdown">
                          <span>Tech: {h.technical ?? 0}</span>
                          <span>Depth: {h.depth ?? 0}</span>
                          <span>Clarity: {h.clarity ?? 0}</span>
                        </div>
                        {h.answer && (
                          <div className="history-answer">{h.answer.slice(0, 120)}…</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </main>

        {/* MOBILE NAV */}
        <div className="mobile-bottom-nav">
          <div className="mobile-bottom-nav-inner">
            {navItems.map((item) => (
              <div
                key={item.key}
                className={`mobile-nav-item ${tab === item.key ? "active" : ""}`}
                onClick={() => setTab(item.key)}
              >
                <span className="mobile-nav-item-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}