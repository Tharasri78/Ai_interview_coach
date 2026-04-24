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
  FiCheckCircle
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
      icon: <FiBookOpen size={22} />,
      title: "Skill-based questions",
      desc: "Questions generated based on your selected topic and extracted skills."
    },
    {
      icon: <FiMessageSquare size={22} />,
      title: "AI answer evaluation",
      desc: "Your answers are scored on technical accuracy, depth, and clarity."
    },
    {
      icon: <FiTarget size={22} />,
      title: "Gap identification",
      desc: "Understand exactly where your answer lacks depth or clarity."
    },
    {
      icon: <FiAward size={22} />,
      title: "Topic-focused practice",
      desc: "Practice specific topics instead of random interview questions."
    },
    {
      icon: <FiTrendingUp size={22} />,
      title: "Adaptive difficulty",
      desc: "Difficulty adjusts based on your performance during the session."
    },
    {
      icon: <FiBarChart2 size={22} />,
      title: "Performance tracking",
      desc: "Track your scores and improvement across sessions."
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Upload your resources",
      desc: "Upload PDFs of your learning material. Prepply extracts key concepts automatically."
    },
    {
      num: "02",
      title: "Choose a topic",
      desc: "Select any topic from your materials or enter a new one to practice."
    },
    {
      num: "03",
      title: "Answer questions",
      desc: "Write your own answers — no multiple choice, just real interview practice."
    },
    {
      num: "04",
      title: "Get AI feedback",
      desc: "Receive detailed scores and actionable insights to improve your answers."
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
            AI-Powered Interview Coach
          </div>
          
          <h1 className="hero-title">
            Prepare smarter.<br />
            <span className="gradient-text">Master</span> your interview.
          </h1>
          
          <p className="hero-description">
            Practice with targeted interview questions based on your skills and topics.
            Get instant AI feedback on every answer and track your progress over time.
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
              <FiCpu className="stat-icon" />
              <div>
                <div className="stat-value">AI-powered</div>
                <div className="stat-label">Smart evaluation</div>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <FiZap className="stat-icon" />
              <div>
                <div className="stat-value">Real-time</div>
                <div className="stat-label">Instant feedback</div>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <FiActivity className="stat-icon" />
              <div>
                <div className="stat-value">Track progress</div>
                <div className="stat-label">Performance summary</div>
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
            <h2 className="section-title">Built differently<br />from the ground up</h2>
            <p className="section-subtitle">
              Most tools guess what you need to know. Prepply knows — because it reads exactly what you give it.
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
            <h2 className="section-title">Four steps to success<br />No guesswork</h2>
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

      {/* SUMMARY FEATURE SECTION */}
      <section className="summary-section">
        <div className="container">
          <div className="section-header fade-up">
            <div className="section-label">Track your growth</div>
            <h2 className="section-title">Performance summary<br />at your fingertips</h2>
            <p className="section-subtitle">
              Get detailed insights about your strengths, weaknesses, and progress over time.
            </p>
          </div>
          
          <div className="summary-grid">
            <div className="summary-card fade-up">
              <div className="summary-icon"><FiBarChart2 size={32} /></div>
              <h3>Skill Breakdown</h3>
              <p>See your scores across technical accuracy, depth, and clarity</p>
            </div>
            <div className="summary-card fade-up">
              <div className="summary-icon"><FiTarget size={32} /></div>
              <h3>Strong & Weak Areas</h3>
              <p>Identify what you excel at and what needs improvement</p>
            </div>
            <div className="summary-card fade-up">
              <div className="summary-icon"><FiTrendingUp size={32} /></div>
              <h3>Topic Performance</h3>
              <p>Track how you perform across different subjects and topics</p>
            </div>
            <div className="summary-card fade-up">
              <div className="summary-icon"><FiSun size={32} /></div>
              <h3>Personalized Tips</h3>
              <p>Get actionable recommendations to level up your skills</p>
            </div>
          </div>
        </div>
      </section>

      {/* CALLOUT SECTION */}
      <section className="callout">
        <div className="callout-content">
          <p className="callout-quote">
            "Focused interview practice with real-time AI feedback and performance tracking."
          </p>
          <p className="callout-credit">
            Designed for students, engineers, and anyone who prepares seriously.
          </p>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to prepare properly?</h2>
          <p className="cta-description">
            Upload your first document and get your first question in under a minute.
          </p>
          <button className="btn-cta" onClick={() => navigate("/auth")}>
            Get started — it's free <FiArrowRight />
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