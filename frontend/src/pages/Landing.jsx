import "./Landing.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function Landing() {
  const navigate = useNavigate();

  // Scroll-triggered fade-up
  useEffect(() => {
    const els = document.querySelectorAll(".fade-up");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Nav shadow on scroll
  useEffect(() => {
    const nav = document.querySelector(".nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    { n: "01", title: "Document-grounded questions", desc: "Every question is retrieved from your uploaded PDF using RAG. No generic banks, no filler." },
    { n: "02", title: "Evaluated against source", desc: "Your answer is scored by comparing it to the original content — not a generic rubric." },
    { n: "03", title: "Identifies what you missed", desc: "Prepply tells you which specific points were absent from your answer so you can target gaps." },
    { n: "04", title: "Topic-focused sessions", desc: "Enter any topic from your document and get a question scoped precisely to that subject." },
    { n: "05", title: "Adaptive difficulty", desc: "Questions adjust based on your performance across the session using the next-question API." },
    { n: "06", title: "Session history", desc: "Every attempt is recorded. Review your scores, track improvement, and revisit hard questions." },
  ];

  const steps = [
    { n: "1", title: "Upload your document", desc: "Drop in a PDF — notes, a chapter, a job description. Prepply indexes it immediately." },
    { n: "2", title: "Choose a topic", desc: "Type any topic from your material. Prepply retrieves the most relevant content." },
    { n: "3", title: "Answer the question", desc: "Write your response in your own words. No multiple choice — real open-ended answers." },
    { n: "4", title: "Get scored instantly", desc: "See your score, read detailed feedback, and find out exactly what you missed." },
  ];

  return (
    <div>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <span className="nav-logo-dot" />
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
        <div className="hero-glow" />

        <div className="hero-eyebrow">✦ AI Interview Coach</div>

        <h1>
          Study smarter.<br />
          <span className="accent-word">Master</span> your interview.
        </h1>

        <p className="hero-sub">
          Upload any document — lecture notes, textbooks, job descriptions.
          Prepply generates precise questions from your content and evaluates every answer.
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
            <div className="proof-num">RAG</div>
            <div className="proof-label">Grounded answers only</div>
          </div>
          <div className="proof-divider" />
          <div className="proof-stat">
            <div className="proof-num">0</div>
            <div className="proof-label">Hallucinated questions</div>
          </div>
          <div className="proof-divider" />
          <div className="proof-stat">
            <div className="proof-num">Real‑time</div>
            <div className="proof-label">Scored feedback</div>
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

      {/* CALLOUT */}
      <div className="callout-section">
        <div className="callout-inner fade-up">
          <p className="callout-quote">"The only AI prep tool that actually reads your notes — not the internet."</p>
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
          <span className="footer-logo-dot" /> Prepply
        </div>
        <span>© 2025 Prepply. All rights reserved.</span>
      </footer>
    </div>
  );
}
