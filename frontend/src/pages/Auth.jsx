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

  const handleSubmit = async () => {
    setError("");

    // -------- BASIC VALIDATION --------
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    // -------- SIGNUP VALIDATION --------
    if (mode === "signup") {
      if (!name.trim()) {
        setError("Full name is required");
        return;
      }

        if (password.length < 6) {
         setError("Password must be at least 6 characters");
         return;
}
    }

    setLoading(true);

    try {
      let res;

      if (mode === "signup") {
        res = await signupUser(name || "User", email, password);
      } else {
        res = await loginUser(email, password);
      }

      if (!res?.data) {
        setError("Server error. Try again.");
        setLoading(false);
        return;
      }

      localStorage.setItem("user_id", res.data.user_id || "");
      localStorage.setItem("user_name", res.data.name || "");
      localStorage.setItem("user_email", res.data.email || "");

      navigate("/dashboard");

    } catch (err) {
      if (mode === "login") {
        setError("Invalid email or password");
      } else {
        setError("Signup failed. Try a different email");
      }
    }

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

          <h2>
            Prepare smarter.<br />
            Interview with confidence.
          </h2>

          <p>
            Practice interview questions based on your skills and chosen topics.
            Get AI-powered feedback on every answer and improve over time.
          </p>

          <div className="auth-left-features">
            {[
              { icon: "✦", text: "Upload your resume or learning material to get started" },
              { icon: "✦", text: "Practice questions based on selected topics" },
              { icon: "✦", text: "Get detailed AI feedback on your answers" },
            ].map((f, i) => (
              <div className="auth-feature" key={i}>
                <div className="auth-feature-icon">{f.icon}</div>
                {f.text}
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

          <h1 className="auth-heading">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>

          <p className="auth-sub">
            {mode === "login"
              ? "Sign in to continue your session."
              : "Start preparing in minutes."}
          </p>

          <div className="auth-toggle">
            <button
              className={`toggle-btn ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Log in
            </button>

            <button
              className={`toggle-btn ${mode === "signup" ? "active" : ""}`}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>

          <div className="auth-form">
            {error && <div className="form-error">{error}</div>}

            {mode === "signup" && (
              <div className="form-field">
                <label className="form-label">Full name</label>
                <input
                  className="form-input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="form-field">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Password</label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSubmit()
                  }
                />

                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
            </div>

            <button
              className="btn-submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : mode === "login"
                ? "Sign in →"
                : "Create account →"}
            </button>
          </div>

          <p className="auth-footer">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <span
              onClick={() =>
                setMode(mode === "login" ? "signup" : "login")
              }
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}