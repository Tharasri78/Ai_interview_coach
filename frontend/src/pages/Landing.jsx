import "./Landing.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

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
      n: "01",
      title: "Skill-based questions",
      desc: "Questions are generated based on your selected topic and extracted skills."
    },
    {
      n: "02",
      title: "AI answer evaluation",
      desc: "Your answers are scored on technical accuracy, depth, and clarity."
    },
    {
      n: "03",
      title: "Gap identification",
      desc: "Understand exactly where your answer lacks depth or clarity."
    },
    {
      n: "04",
      title: "Topic-focused practice",
      desc: "Practice specific topics instead of random interview questions."
    },
    {
      n: "05",
      title: "Adaptive difficulty",
      desc: "Difficulty adjusts based on your performance during the session."
    },
    {
      n: "06",
      title: "Performance tracking",
      desc: "Track your scores and improvement across sessions."
    },
  ];

  const steps = [
    {
      n: "1",
      title: "Upload your resources",
      desc: "Extract skills automatically to personalize your practice."
    },
    {
      n: "2",
      title: "Choose a topic",
      desc: "Select the area you want to practice."
    },
    {
      n: "3",
      title: "Answer questions",
      desc: "Respond with your own explanation — no MCQs."
    },
    {
      n: "4",
      title: "Get AI feedback",
      desc: "Receive scores and insights to improve your answers."
    },
  ];

  return (
    <div>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <span className="nav-logo-mark">P</span>
          Prepply
        </div>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#process">How it works</a></li>
        </ul>
        <div className="nav-cta">
          <button className="btn-ghost" onClick={() => navigate("/auth")}>Sign in</button>
          <button className="btn-nav-primary" onClick={() => navigate("/auth")}>Get started</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-grid" />
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />

        <div className="hero-eyebrow">
          <span className="eyebrow-dot" /> AI Interview Coach
        </div>

        <h1>
          <span className="word">Prepare</span>{' '}
          <span className="word">smarter.</span><br />
          <span className="word">Interview</span>{' '}
          <span className="word">with</span>{' '}
          <span className="word accent-word">confidence.</span>
        </h1>

        <p className="hero-sub">
          Practice interview questions based on your skills and chosen topics.
          Get AI-powered feedback on every answer and improve over time.
        </p>

        <div className="hero-actions">
          <button className="btn-cta-primary" onClick={() => navigate("/auth")}>
            Start for free <span className="btn-arrow">→</span>
          </button>
          <button className="btn-cta-secondary" onClick={() => document.getElementById("process")?.scrollIntoView({ behavior: "smooth" })}>
            See how it works
          </button>
        </div>

        <div className="hero-proof">
          <div className="proof-stat">
            <div className="proof-num">AI-powered</div>
            <div className="proof-label">Smart evaluation</div>
          </div>
          <div className="proof-divider" />
          <div className="proof-stat">
            <div className="proof-num">Real-time</div>
            <div className="proof-label">Instant feedback</div>
          </div>
          <div className="proof-divider" />
          <div className="proof-stat">
            <div className="proof-num">Track progress</div>
            <div className="proof-label">Performance summary</div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* FEATURES */}
      <div className="features-section" id="features">
        <div className="section-wrapper">
          <div className="fade-up">
            <div className="section-label">Why Prepply</div>
            <h2 className="section-heading">Built differently<br />from the ground up</h2>
            <p className="section-body">Most tools guess what you need to know. Prepply knows — because it reads exactly what you give it.</p>
          </div>

          <div className="features-grid fade-up">
            {features.map((f) => (
              <div className="feature-cell" key={f.n}>
                <div className="feature-num">{f.n}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PROCESS */}
      <div className="process-section" id="process">
        <div className="fade-up">
          <div className="section-label">How it works</div>
          <h2 className="section-heading">Four steps.<br />No guesswork.</h2>
        </div>

        <div className="process-steps">
          {steps.map((s, i) => (
            <div className="process-step fade-up" key={s.n} style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="step-index">{s.n}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SUMMARY FEATURE SECTION - NEW */}
      <div className="summary-feature-section">
        <div className="section-wrapper">
          <div className="fade-up">
            <div className="section-label">Track Your Growth</div>
            <h2 className="section-heading">Performance summary<br />at your fingertips</h2>
            <p className="section-body">Get detailed insights about your strengths, weaknesses, and progress over time.</p>
          </div>

          <div className="summary-highlights fade-up">
            <div className="summary-highlight-card">
              <div className="highlight-icon">📊</div>
              <h3>Skill Breakdown</h3>
              <p>See your scores across technical accuracy, depth, and clarity</p>
            </div>
            <div className="summary-highlight-card">
              <div className="highlight-icon">🎯</div>
              <h3>Strong & Weak Areas</h3>
              <p>Identify what you excel at and what needs improvement</p>
            </div>
            <div className="summary-highlight-card">
              <div className="highlight-icon">📈</div>
              <h3>Topic Performance</h3>
              <p>Track how you perform across different subjects and topics</p>
            </div>
            <div className="summary-highlight-card">
              <div className="highlight-icon">💡</div>
              <h3>Personalized Tips</h3>
              <p>Get actionable recommendations to level up your skills</p>
            </div>
          </div>
        </div>
      </div>

      {/* CALLOUT */}
      <div className="callout-section">
        <div className="callout-inner fade-up">
          <p className="callout-quote">"Focused interview practice with real-time AI feedback and <em>performance tracking</em>."</p>
          <p className="callout-attr">Designed for students, engineers, and anyone who prepares seriously.</p>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-band">
        <div className="cta-band-inner fade-up">
          <h2>Ready to prepare properly?</h2>
          <p>Upload your first document and get your first question in under a minute.</p>
          <button className="btn-cta-primary" onClick={() => navigate("/auth")}>
            Get started — it's free <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>

      <footer>
        <div className="footer-logo">
          <span className="footer-logo-mark">P</span> Prepply
        </div>
        <span>© 2026 Prepply. All rights reserved.</span>
      </footer>
    </div>
  );
}