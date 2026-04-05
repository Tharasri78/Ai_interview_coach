import { useState, useEffect } from "react";
import "./Dashboard.css";
import Upload from "../components/Upload";
import Question from "../components/Question";
import Answer from "../components/Answer";
import API from "../api";

export default function Dashboard({ setPage }) {
  const [tab, setTab] = useState("practice");

  // Real state — each step only unlocks after previous completes
  const [isUploaded, setIsUploaded] = useState(false);
  const [questionData, setQuestionData] = useState(null); // full question object
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const userId = Number(localStorage.getItem("user_id")) || 1;
  const userName = localStorage.getItem("user_name") || "User";
  const userEmail = localStorage.getItem("user_email") || "";

  // Fetch history when tab switches to history
  useEffect(() => {
    if (tab === "history") fetchHistory();
  }, [tab]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await API.get(`/history/${userId}`);
      setHistory(res.data || []);
    } catch {
      setHistory([]); // fail silently, show empty state
    }
    setHistoryLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    setPage("landing");
  };

  const step = !isUploaded ? 1 : !questionData ? 2 : 3;

  const navItems = [
    { icon: "🎯", label: "Practice", key: "practice" },
    { icon: "📊", label: "History", key: "history" },
    { icon: "⚙️", label: "Settings", key: "settings" },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => setPage("landing")} style={{ cursor: "pointer" }}>
          Interview<span>AI</span>
        </div>

        <div className="sidebar-section-label">Main</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div key={item.key}
              className={`sidebar-item ${tab === item.key ? "active" : ""}`}
              onClick={() => setTab(item.key)}>
              <span className="sidebar-item-icon">{item.icon}</span>
              {item.label}
              {item.key === "history" && history.length > 0 && (
                <span className="sidebar-item-badge">{history.length}</span>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-section-label">Resources</div>
        <nav className="sidebar-nav">
          <div className="sidebar-item"><span className="sidebar-item-icon">📄</span>My PDFs</div>
          <div className="sidebar-item"><span className="sidebar-item-icon">❓</span>Help</div>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{userName[0].toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{userName}</div>
            <div className="user-role">Free Plan</div>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">

        {tab === "practice" && (
          <>
            <div className="page-header">
              <h1 className="page-title">Practice Session</h1>
              <p className="page-subtitle">Complete each step in order to start your session.</p>
            </div>

            {/* REAL FLOW INDICATOR */}
            <div className="flow-steps">
              {[{ n: 1, label: "Upload PDF" }, { n: 2, label: "Generate Question" }, { n: 3, label: "Submit Answer" }].map((s, i) => (
                <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className={`flow-step ${step === s.n ? "active" : step > s.n ? "done" : ""}`}>
                    <div className="flow-step-num">{step > s.n ? "✓" : s.n}</div>
                    {s.label}
                  </div>
                  {i < 2 && <span className="flow-arrow">→</span>}
                </div>
              ))}
            </div>

            <div className="dashboard-grid">
              {/* STEP 1: Upload — always available */}
              <Upload
                userId={userId}
                onUploaded={() => setIsUploaded(true)}
                isUploaded={isUploaded}
              />

              {/* STEP 2: Question — locked until upload done */}
              <Question
                userId={userId}
                disabled={!isUploaded}
                onQuestion={(data) => setQuestionData(data)}
              />
            </div>

            {/* STEP 3: Answer — locked until question generated */}
            <div style={{ marginTop: 24 }}>
              <Answer
                userId={userId}
                questionData={questionData}
                disabled={!questionData}
                onAnswered={fetchHistory}
              />
            </div>
          </>
        )}

        {tab === "history" && (
          <>
            <div className="page-header">
              <h1 className="page-title">Session History</h1>
              <p className="page-subtitle">Your past questions and scores.</p>
            </div>
            <div className="card">
              <div className="card-header">
                <div className="card-title-group">
                  <div className="card-icon blue">📊</div>
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
                  <div className="history-item" key={i}>
                    <div className={`history-score ${h.score >= 85 ? "score-hi" : h.score >= 60 ? "score-mid" : "score-lo"}`}>
                      {h.score ?? "—"}
                    </div>
                    <div>
                      <div className="history-question">{h.question}</div>
                      <div className="history-topic">📌 {h.topic}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "settings" && (
          <>
            <div className="page-header">
              <h1 className="page-title">Settings</h1>
              <p className="page-subtitle">Manage your account.</p>
            </div>
            <div className="card" style={{ maxWidth: 500 }}>
              <div className="card-header">
                <div className="card-title-group">
                  <div className="card-icon blue">⚙️</div>
                  <div><div className="card-title">Account Settings</div></div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div className="field-label">Display Name</div>
                  <input className="text-input" defaultValue={userName} />
                </div>
                <div>
                  <div className="field-label">Email</div>
                  <input className="text-input" defaultValue={userEmail} />
                </div>
                <div>
                  <div className="field-label">User ID</div>
                  <input className="text-input" value={userId} readOnly
                    style={{ opacity: 0.5, cursor: "not-allowed" }} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-blue btn-sm">Save Changes</button>
                  <button className="btn btn-outline btn-sm" onClick={handleLogout}>Log Out</button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}