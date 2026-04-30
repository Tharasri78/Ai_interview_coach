import "./Landing.css";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { 
  FiTrendingUp, 
  FiTarget, 
  FiBarChart2, 
  FiSun,
  FiCpu,
  FiZap,
  FiActivity,
  FiArrowRight,
  FiBookOpen,
  FiMessageSquare,
  FiAward,
  FiCheckCircle,
  FiUpload,
  FiCode,
  FiUserCheck,
  FiClock
} from "react-icons/fi";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const els = document.querySelectorAll(".fade-up");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const nav = document.querySelector(".nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    {
      icon: <FiUpload size={22} />,
      title: "Resume-Based Questions",
      desc: "Upload your resume and get personalized questions based on your actual experience and skills."
    },
    {
      icon: <FiCpu size={22} />,
      title: "AI-Powered Evaluation",
      desc: "Get detailed scores on technical accuracy, depth, and clarity with actionable feedback."
    },
    {
      icon: <FiTarget size={22} />,
      title: "3-Round Interview Flow",
      desc: "HR → Technical → Deep Dive - mirrors real interview processes at top tech companies."
    },
    {
      icon: <FiCode size={22} />,
      title: "Coding Challenges",
      desc: "Solve algorithmic problems with test case validation and instant feedback."
    },
    {
      icon: <FiTrendingUp size={22} />,
      title: "Adaptive Difficulty",
      desc: "Questions adjust to your performance - harder when you excel, easier when you struggle."
    },
    {
      icon: <FiBarChart2 size={22} />,
      title: "Performance Analytics",
      desc: "Track strengths, weaknesses, and improvement over time with detailed summaries."
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Upload Your Resume",
      desc: "Upload your PDF resume. Our AI extracts your skills, projects, and experience."
    },
    {
      num: "02",
      title: "Start Interview",
      desc: "Begin a structured 6-question interview across HR, Technical, and Deep Dive rounds."
    },
    {
      num: "03",
      title: "Answer Questions",
      desc: "Write detailed answers. Get real-time feedback on quality and structure."
    },
    {
      num: "04",
      title: "Review & Improve",
      desc: "Receive scores, model answers, and personalized recommendations to level up."
    },
  ];

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-logo" onClick={() => navigate("/")}>
            <span className="logo-text">Prepply</span>
          </div>
          
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#process" className="nav-link">How it works</a>
          </div>
          
          <div className="nav-buttons">
            <button className="btn-outline" onClick={() => navigate("/auth")}>Sign in</button>
            <button className="btn-primary" onClick={() => navigate("/auth")}>Get started</button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob-1"></div>
          <div className="hero-blob-2"></div>
          <div className="hero-blob-3"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            AI-Powered Interview Preparation
          </div>
          
          <h1 className="hero-title">
            Ace your next<br />
            <span className="gradient-text">technical interview</span>
          </h1>
          
          <p className="hero-description">
            Practice with realistic interview questions generated from your resume.
            Get instant AI feedback, track your progress, and land your dream job.
          </p>
          
          <div className="hero-buttons">
            <button className="btn-hero-primary" onClick={() => navigate("/auth")}>
              Start practicing <FiArrowRight />
            </button>
            <button className="btn-hero-secondary" onClick={() => document.getElementById("process")?.scrollIntoView({ behavior: "smooth" })}>
              How it works
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <FiCheckCircle className="stat-icon" />
              <div>
                <div className="stat-value">6 Questions</div>
                <div className="stat-label">Complete interview flow</div>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <FiZap className="stat-icon" />
              <div>
                <div className="stat-value">Instant</div>
                <div className="stat-label">AI feedback</div>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <FiActivity className="stat-icon" />
              <div>
                <div className="stat-value">Track</div>
                <div className="stat-label">Your progress</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header fade-up">
            <div className="section-label">Why choose Prepply</div>
            <h2 className="section-title">Everything you need to<br />succeed in interviews</h2>
            <p className="section-subtitle">
              Unlike generic platforms, Prepply adapts to YOUR resume and skill level.
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div className="feature-card fade-up" key={index} style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="process" className="process">
        <div className="container">
          <div className="section-header fade-up">
            <div className="section-label">Simple process</div>
            <h2 className="section-title">Get interview-ready in<br />4 simple steps</h2>
          </div>
          
          <div className="process-steps">
            {steps.map((step, index) => (
              <div className="process-step fade-up" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="step-number">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERVIEW STRUCTURE SECTION */}
      <section className="summary-section">
        <div className="container">
          <div className="section-header fade-up">
            <div className="section-label">Interview Structure</div>
            <h2 className="section-title">Real interview format<br />that works</h2>
            <p className="section-subtitle">
              6 questions across 3 rounds - exactly like real technical interviews.
            </p>
          </div>
          
          <div className="summary-grid">
            <div className="summary-card fade-up">
              <div className="summary-icon"><FiUserCheck size={32} /></div>
              <h3>HR Round</h3>
              <p>Behavioral questions about your projects, teamwork, and problem-solving approach.</p>
            </div>
            <div className="summary-card fade-up">
              <div className="summary-icon"><FiCode size={32} /></div>
              <h3>Technical Round</h3>
              <p>Resume-based questions, core concepts, and coding challenges with test cases.</p>
            </div>
            <div className="summary-card fade-up">
              <div className="summary-icon"><FiCpu size={32} /></div>
              <h3>Deep Dive Round</h3>
              <p>Follow-up questions that test your depth of understanding and reasoning.</p>
            </div>
            <div className="summary-card fade-up">
              <div className="summary-icon"><FiBarChart2 size={32} /></div>
              <h3>Performance Summary</h3>
              <p>Detailed scores, strengths analysis, and personalized improvement tips.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CALLOUT SECTION */}
      <section className="callout">
        <div className="callout-content">
          <p className="callout-quote">
            "The questions actually matched my resume. The feedback helped me understand exactly where I need to improve."
          </p>
          <p className="callout-credit">
            — Interview practice that delivers results
          </p>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to crush your interview?</h2>
          <p className="cta-description">
            Join thousands of candidates who prepared with Prepply.
          </p>
          <button className="btn-cta" onClick={() => navigate("/auth")}>
            Start practicing — it's free <FiArrowRight />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span>Prepply</span>
          </div>
          <div className="footer-copyright">
            © 2026 Prepply. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}