import { useState } from "react";
import { signupUser, loginUser } from "../api/apiService";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    if (!email || !password) return "Email and password are required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
    if (mode === "signup" && !name.trim()) return "Full name is required";
    if (mode === "signup" && password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const handleSubmit = async () => {
    const errorMsg = validate();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = mode === "signup" 
        ? await signupUser(name, email, password)
        : await loginUser(email, password);

      if (!res?.data) throw new Error("No response");

      localStorage.setItem("user_id", res.data.user_id || "");
      localStorage.setItem("user_name", res.data.name || "");
      localStorage.setItem("user_email", res.data.email || "");
      navigate("/dashboard");
    } catch (err) {
      setError(mode === "login" ? "Invalid email or password" : "Signup failed. Try a different email");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Upload your resume to get started",
    "Personalized interview questions",
    "Detailed AI feedback on answers",
    "Track progress with performance summary"
  ];

  return (
    <div className="auth-page">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-logo" onClick={() => navigate("/")}>
            <span className="auth-left-logo-dot" /> Prepply
          </div>
          <h2>Prepare smarter.<br />Interview with confidence.</h2>
          <div className="auth-left-features">
            {features.map((text, i) => (
              <div className="auth-feature" key={i}>
                <div className="auth-feature-icon">✦</div>
                {text}
              </div>
            ))}
          </div>
        </div>
        <div className="auth-left-bottom">
          <div className="auth-left-stat">Smart evaluation.</div>
          <div className="auth-left-stat-label">Real improvement.</div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-mobile-logo" onClick={() => navigate("/")}>
            <span className="auth-mobile-logo-dot" /> Prepply
          </div>

          <h1 className="auth-heading">{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p className="auth-sub">{mode === "login" ? "Sign in to continue" : "Start preparing in minutes"}</p>

          <div className="auth-toggle">
            <button className={`toggle-btn ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Log in</button>
            <button className={`toggle-btn ${mode === "signup" ? "active" : ""}`} onClick={() => setMode("signup")}>Sign up</button>
          </div>

          <div className="auth-form">
            {error && <div className="form-error">{error}</div>}

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
              <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
                <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
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