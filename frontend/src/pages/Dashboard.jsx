import { useState, useEffect } from "react";
import "./Dashboard.css";
import Upload from "../components/Upload";
import InterviewBox from "../components/InterviewBox";
import HistoryPanel from "../components/HistoryPanel";
import Summary from "./Summary";
import { getHistory, startInterview } from "../api/apiService";
import { useNavigate } from "react-router-dom";
import { 
  FaBullseye, 
  FaChartBar, 
  FaSignOutAlt, 
  FaChartLine,
  FaPlay,
  FaHistory,
  FaChartPie
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("practice");
  const [isUploaded, setIsUploaded] = useState(false);
  const [history, setHistory] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [total, setTotal] = useState(6);
  const [round, setRound] = useState(1);
  const [starting, setStarting] = useState(false);
  
  const userId = Number(localStorage.getItem("user_id"));
  const userName = localStorage.getItem("user_name") || "User";

  useEffect(() => {
    if (!userId) navigate("/");
  }, [userId, navigate]);

  useEffect(() => {
    const checkUploadStatus = () => {
      const uploaded = localStorage.getItem("uploaded");
      if (uploaded === "true") {
        setIsUploaded(true);
      }
    };
    checkUploadStatus();
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
      console.log("Start response:", res.data);
      
      if (!res.data) {
        throw new Error("No data received");
      }
      
      setQuestion(res.data);
      setRound(res.data.round || 1);
      setCurrentIndex(res.data.q_index || 1);
      setTotal(res.data.total || 6);
      setStarted(true);
      
    } catch (err) {
      console.error("Start interview error:", err);
      alert("Failed to start interview. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  const handleNext = (nextData) => {
    console.log("Next data:", nextData);
    
    if (!nextData) return;
    
    setQuestion(nextData);
    setRound(nextData.round || round);
    setCurrentIndex(nextData.q_index || currentIndex + 1);
    setTotal(nextData.total || total);
  };

  const navItems = [
    { icon: <FaBullseye />, label: "Practice", key: "practice" },
    { icon: <FaHistory />, label: "History", key: "history" },
    { icon: <FaChartPie />, label: "Summary", key: "summary" },
  ];

  const FeedbackTag = ({ score }) => {
    if (score >= 8) return <span className="feedback-tag feedback-strong">Strong</span>;
    if (score >= 5) return <span className="feedback-tag feedback-average">Average</span>;
    return <span className="feedback-tag feedback-weak">Weak</span>;
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
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

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mobile Topbar */}
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
          >
            ☰
          </button>
        </div>

        <main className="dashboard-main">
          {/* Practice Tab */}
          {tab === "practice" && (
            <>
              <div className="page-header">
                <h1 className="page-title">Practice Session</h1>
                <p className="page-subtitle">
                  {isUploaded 
                    ? "Begin your interview preparation" 
                    : "Upload your resume to start interview preparation"}
                </p>
              </div>

              {/* Upload Section */}
              <Upload userId={userId} onUploaded={setIsUploaded} isUploaded={isUploaded} />

              {/* Start Interview Button */}
              {!started && (
                <button
                  className={`btn btn-primary btn-full ${!isUploaded ? "btn-disabled" : ""}`}
                  style={{ marginTop: 20 }}
                  onClick={startHandler}
                  disabled={!isUploaded || starting}
                >
                  <FaPlay /> {starting ? "Starting..." : "Start Interview"}
                </button>
              )}

              {/* Interview Box */}
              {started && question && (
                <InterviewBox
                  userId={userId}
                  question={question}
                  round={round}
                  index={currentIndex}
                  total={total}
                  onNext={handleNext}
                />
              )}
            </>
          )}

          {/* History Tab */}
         {tab === "history" && (
  <>
    <div className="page-header">
      <h1 className="page-title">Session History</h1>
      <p className="page-subtitle">Review your past interview performance</p>
    </div>
    <HistoryPanel userId={userId} />
  </>
)}
        </main>
      </div>
      {tab === "summary" && (
  <Navigate to="/summary" replace />
)}

      {/* Mobile Bottom Navigation */}
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