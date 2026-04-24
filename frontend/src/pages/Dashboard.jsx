import { useState, useEffect } from "react";
import "./Dashboard.css";
import Upload from "../components/Upload";
import Question from "../components/Question";
import Answer from "../components/Answer";
import { getHistory, generateQuestion } from "../api/apiService";
import { useNavigate } from "react-router-dom";
import { FaBullseye, FaChartBar, FaSignOutAlt, FaChartLine } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("practice");
  const [isUploaded, setIsUploaded] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // ✅ FIX: only ONE topic state
  const [topic, setTopic] = useState("");

  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);

  const [history, setHistory] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const userId = Number(localStorage.getItem("user_id"));
  const userName = localStorage.getItem("user_name") || "User";

  useEffect(() => {
    if (!userId) navigate("/");
  }, [userId, navigate]);

  useEffect(() => {
    if (tab === "history") fetchHistory();
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

  // ✅ SINGLE SOURCE OF TRUTH
  const handleQuestionGenerated = (question) => {
    if (!question) return;

    if (question.error) {
      console.error("Question error:", question.error);
      return;
    }

    setCurrentQuestion(question);
    setAnswerSubmitted(false);
    setCurrentResult(null);
  };

  const handleAnswerSubmit = (result) => {
    setAnswerSubmitted(true);
    setCurrentResult(result);
    fetchHistory();
  };

  const handleTryAgain = () => {
    setAnswerSubmitted(false);
    setCurrentResult(null);
  };

  // ✅ FIXED NEXT QUESTION
  const handleNewQuestion = async () => {
    if (!topic || topic.trim().length < 2) {
      alert("Enter topic first");
      return;
    }

    try {
      const res = await generateQuestion(userId, topic);

      // ✅ ALWAYS USE SAME HANDLER
      handleQuestionGenerated(res.data);

    } catch (err) {
      console.error("Next question failed:", err);
    }
  };

  const showUploadGuidance = !isUploaded;
  const showQuestionGuidance = isUploaded && !currentQuestion;
  const showAnswerGuidance = currentQuestion && !answerSubmitted;

  const navItems = [
    { icon: <FaBullseye />, label: "Practice", key: "practice" },
    { icon: <FaChartBar />, label: "History", key: "history" },
    { icon: <FaChartLine />, label: "Summary", key: "summary" },
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
              onClick={() => {
                if (item.key === "summary") {
                  navigate("/summary");
                } else {
                  setTab(item.key);
                }
              }}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              {item.label}
              {item.key === "history" && history.length > 0 && (
                <span className="sidebar-item-badge">{history.length}</span>
              )}
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

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* MOBILE TOPBAR */}
        <div className="mobile-topbar">
          <div className="mobile-topbar-logo">
            <span className="mobile-topbar-logo-dot" /> Prepply
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 500 }}>
            {navItems.find(n => n.key === tab)?.label}
          </div>
          <button 
            className="mobile-menu-btn"
            onClick={() => {
              const sidebar = document.querySelector('.sidebar');
              sidebar?.classList.toggle('mobile-open');
            }}
          />
        </div>

        <main className="dashboard-main">

          {/* PRACTICE */}
          {tab === "practice" && (
            <>
              <div className="page-header">
                <h1 className="page-title">Practice Session</h1>
                <p className="page-subtitle">
                  {isUploaded 
                    ? "Upload PDF  | Now generate questions and practice!" 
                    : "Upload your learning material to start practicing"}
                </p>
              </div>

              <div className="flow-steps">
                {[{ n: 1, label: "Upload PDF", active: showUploadGuidance, done: isUploaded },
                  { n: 2, label: "Generate Question", active: showQuestionGuidance, done: currentQuestion !== null },
                  { n: 3, label: "Submit Answer", active: showAnswerGuidance, done: answerSubmitted }
                ].map((s, i) => (
                  <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className={`flow-step ${s.active ? "active" : s.done ? "done" : ""}`}>
                      <div className="flow-step-num">{s.done ? "✓" : s.n}</div>
                      {s.label}
                    </div>
                    {i < 2 && <span className="flow-arrow">›</span>}
                  </div>
                ))}
              </div>

              <div className="dashboard-grid">
                <Upload userId={userId} onUploaded={setIsUploaded} isUploaded={isUploaded} />

                <Question
                  userId={userId}
                  isUploaded={isUploaded}
                  onQuestionGenerated={handleQuestionGenerated}
                  currentQuestion={currentQuestion}
                  topic={topic}
                  setTopic={setTopic}
                />
              </div>

              <div style={{ marginTop: 20 }}>
                <Answer
                  userId={userId}
                  currentQuestion={currentQuestion}
                  onAnswerSubmit={handleAnswerSubmit}
                  onTryAgain={handleTryAgain}
                  onNewQuestion={handleNewQuestion}
                  answerSubmitted={answerSubmitted}
                  currentResult={currentResult}
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
                  <button className="btn btn-outline btn-sm" onClick={fetchHistory}>Refresh</button>
                </div>

                {historyLoading && <div className="loading-bar"><div className="loading-bar-fill" /></div>}

                {!historyLoading && history.length === 0 && (
                  <div className="msg msg-info">No history yet.</div>
                )}

                <div className="history-list">
                  {history.map((h, i) => (
                    <div className="history-item" key={i} onClick={() => setOpenIndex(i === openIndex ? null : i)}>
                      <div className={`history-score ${h.overall >= 8 ? "score-hi" : h.overall >= 5 ? "score-mid" : "score-lo"}`}>
                        {typeof h.overall === "number" ? h.overall.toFixed(1) : "—"}
                      </div>
                      <div className="history-content">
                        <div className="history-question">
                          {h.question?.slice(0, 80)}
                          <FeedbackTag score={h.overall} />
                        </div>
                        {openIndex === i && (
                          <div className="history-details">
                            <strong>Your Answer:</strong> {h.answer}
                          </div>
                        )}
                        <div className="history-breakdown">
                          <span>Tech: {h.technical ?? 0}</span>
                          <span>Depth: {h.depth ?? 0}</span>
                          <span>Clarity: {h.clarity ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* MOBILE NAV */}
      <div className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-inner">
          {navItems.map((item) => (
            <div
              key={item.key}
              className={`mobile-nav-item ${tab === item.key ? "active" : ""}`}
              onClick={() => item.key === "summary" ? navigate("/summary") : setTab(item.key)}
            >
              <span className="mobile-nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}