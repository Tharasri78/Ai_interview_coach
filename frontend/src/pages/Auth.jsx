import { useState } from "react";
import { signupUser, loginUser } from "../api/apiService";
import "./Auth.css";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { alert("Email and password required"); return; }
    setLoading(true);
    try {
      let res;
      if (mode === "signup") res = await signupUser(name || "User", email, password);
      else res = await loginUser(email, password);
      if (res.data.error) { alert(res.data.error); setLoading(false); return; }
      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("user_name", res.data.name);
      localStorage.setItem("user_email", res.data.email);
      navigate("/dashboard");
    } catch { alert("Authentication failed"); }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-logo" onClick={() => navigate("/")}>
            <span className="auth-left-logo-dot" /> Prepply
          </div>
          <h2>Prepare smarter.<br />Interview with confidence.</h2>
          <p>AI-powered practice that reads your documents and evaluates every answer against the source.</p>

          <div className="auth-left-features">
            {[
              { icon: "📄", text: "Upload any PDF — notes, textbooks, job descriptions" },
              { icon: "🎯", text: "Get questions grounded in your exact content" },
              { icon: "✦", text: "Receive detailed, scored feedback instantly" },
            ].map((f, i) => (
              <div className="auth-feature" key={i}>
                <div className="auth-feature-icon">{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <div className="auth-left-bottom">
          <div className="auth-left-stat">100%</div>
          <div className="auth-left-stat-label">Document-grounded. Zero hallucinations.</div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-mobile-logo" onClick={() => navigate("/")}>
            <span className="auth-mobile-logo-dot" /> Prepply
          </div>

          <h1 className="auth-heading">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="auth-sub">
            {mode === "login" ? "Sign in to continue your session." : "Start preparing in minutes."}
          </p>

          <div className="auth-toggle">
            <button className={`toggle-btn ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Log in</button>
            <button className={`toggle-btn ${mode === "signup" ? "active" : ""}`} onClick={() => setMode("signup")}>Sign up</button>
          </div>

          <div className="auth-form">
            {mode === "signup" && (
              <div className="form-field">
                <label className="form-label">Full name</label>
                <input className="form-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div className="form-field">
              <label className="form-label">Email address</label>
              <input className="form-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            </div>
            <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? "Loading..." : mode === "login" ? "Sign in →" : "Create account →"}
            </button>
          </div>

          <p className="auth-footer">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
