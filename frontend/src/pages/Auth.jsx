import { useState } from "react";
import "./Auth.css";

export default function Auth({ setPage }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!email || !password) return;
    const userId = Date.now(); 
    localStorage.setItem("user_id", userId);
    localStorage.setItem("user_email", email);
    localStorage.setItem("user_name", name || email.split("@")[0]);
    setLoading(true);
    setTimeout(() => { setLoading(false); setPage("dashboard"); }, 700);
  };

  const handleGuest = () => {
    localStorage.setItem("user_id", "guest_1");
    localStorage.setItem("user_name", "Guest");
    setPage("dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-logo" onClick={() => setPage("landing")}>
          Prep<span>ly</span>
        </span>

        <h1 className="auth-heading">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="auth-sub">
          {mode === "login"
            ? "Sign in to continue your practice sessions."
            : "Start preparing with your own material."}
        </p>

        <div className="auth-toggle">
          <button className={`toggle-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}>Log in</button>
          <button className={`toggle-btn ${mode === "signup" ? "active" : ""}`}
            onClick={() => setMode("signup")}>Sign up</button>
        </div>

        <div className="auth-form">
          {mode === "signup" && (
            <div className="form-field">
              <label className="form-label">Full name</label>
              <input className="form-input" type="text" placeholder="Jane Smith"
                value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>
          <button className="btn-submit" onClick={handleSubmit}
            disabled={loading || !email || !password}>
            {loading ? "Signing in…" : mode === "login" ? "Log in" : "Create account"}
          </button>
          <div className="auth-divider">or</div>
          <button className="btn-guest" onClick={handleGuest}>Continue as guest</button>
        </div>

        <p className="auth-footer">
          {mode === "login" ? "No account? " : "Have an account? "}
          <span onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Sign up" : "Log in"}
          </span>
        </p>
      </div>
    </div>
  );
}