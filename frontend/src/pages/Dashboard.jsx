import { useState, useEffect } from "react";
import "./Dashboard.css";
import Upload from "../components/Upload";
import InterviewBox from "../components/InterviewBox";
import { getHistory, startInterview } from "../api/apiService";
import HistoryPanel from "../components/HistoryPanel";

import { useNavigate } from "react-router-dom";
import { FaBullseye, FaChartBar, FaSignOutAlt, FaChartLine, FaPlay } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("practice");
  const [isUploaded, setIsUploaded] = useState(false);
  const [history, setHistory] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState("");
  const [index, setIndex] = useState(1);
  const [total, setTotal] = useState(6);
  const [round, setRound] = useState(1);
  const [starting, setStarting] = useState(false);
  
  const userId = Number(localStorage.getItem("user_id"));
  const userName = localStorage.getItem("user_name") || "User";

  useEffect(() => {
    if (!userId) navigate("/");
  }, [userId, navigate]);

  useEffect(() => {
    const uploaded = localStorage.getItem("uploaded");
    if (uploaded === "true") setIsUploaded(true);
  }, []);

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

  const startHandler = async () => {
    if (!isUploaded) {
      alert("Please upload your resume first");
      return;
    }
    
    setStarting(true);
    
    try {
      const res = await startInterview(userId);
      setQuestion(res.data.question);
      setRound(res.data.round);
      setIndex(res.data.index);
      setTotal(res.data.total);
      setStarted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to start interview. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  const handleNext = (data) => {
    setQuestion(data.question);
    setRound(data.round);
    setIndex(data.index);
    setTotal(data.total);
  };

  const navItems = [
    { icon: <FaBullseye />, label: "Practice", key: "practice" },
    { icon: <FaChartBar />, label: "History", key: "history" },
    { icon: <FaChartLine />, label: "Summary", key: "summary" },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate("/")}>
          <span className="sidebar-logo-dot" /> Prepply
        </div>
        <div className="sidebar-section-label">Main</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <motion.div
              key={item.key}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              className={`sidebar-item ${tab === item.key ? "active" : ""}`}
              onClick={() => item.key === "summary" ? navigate("/summary") : setTab(item.key)}
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
            <div className="user-role"><span className="user-role-dot" /> Candidate</div>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn btn-outline btn-full" style={{ marginTop: 12 }} onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </motion.button>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="mobile-topbar">
          <div className="mobile-topbar-logo"><span className="mobile-topbar-logo-dot" /> Prepply</div>
          <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{navItems.find(n => n.key === tab)?.label}</div>
          <button className="mobile-menu-btn" onClick={() => document.querySelector('.sidebar')?.classList.toggle('mobile-open')}>☰</button>
        </div>

        <main className="dashboard-main">
          {tab === "practice" && (
            <>
              <div className="page-header">
                <h1 className="page-title">Practice Session</h1>
                <p className="page-subtitle">Upload your resume to begin interview preparation</p>
              </div>

              <Upload userId={userId} onUploaded={setIsUploaded} isUploaded={isUploaded} />

              {!started && (
                <button
                  className={`btn btn-primary btn-full ${!isUploaded ? "btn-disabled" : ""}`}
                  style={{ marginTop: 20 }}
                  onClick={startHandler}
                  disabled={!isUploaded || starting}
                >
                  {starting ? "Starting..." : <><FaPlay /> Start Interview</>}
                </button>
              )}

              {started && (
                <InterviewBox
                  userId={userId}
                  question={question}
                  round={round}
                  index={index}
                  total={total}
                  onNext={handleNext}
                />
              )}
            </>
          )}



{tab === "history" && (
  <>
    <div className="page-header">
      <h1 className="page-title">Performance History</h1>
      <p className="page-subtitle">Review your past interview sessions and track improvement</p>
    </div>
    <HistoryPanel userId={userId} />
  </>
)}
        </main>
      </div>

      <div className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-inner">
          {navItems.map((item) => (
            <div key={item.key} className={`mobile-nav-item ${tab === item.key ? "active" : ""}`} onClick={() => item.key === "summary" ? navigate("/summary") : setTab(item.key)}>
              <span className="mobile-nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}