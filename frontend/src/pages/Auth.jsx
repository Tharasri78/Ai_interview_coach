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
    if (!email || !password) {
      alert("Email and password required");
      return;
    }

    setLoading(true);

    try {
      let res;

      if (mode === "signup") {
        res = await signupUser(name || "User", email, password);
      } else {
        res = await loginUser(email, password);
      }

      if (res.data.error) {
        alert(res.data.error);
        setLoading(false);
        return;
      }

      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("user_name", res.data.name);
      localStorage.setItem("user_email", res.data.email);

      navigate("/dashboard");
    } catch {
      alert("Authentication failed");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">Prep<span>ly</span></div>

        <h1 className="auth-heading">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>

        <p className="auth-sub">
          {mode === "login"
            ? "Login with your credentials"
            : "Create your account"}
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

          {mode === "signup" && (
            <div className="form-field">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn-submit" onClick={handleSubmit}>
            {loading ? "Loading..." : mode === "login" ? "Login →" : "Sign Up →"}
          </button>

        </div>

        <p className="auth-footer">
          {mode === "login" ? "No account? " : "Already have account? "}
          <span onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Sign up" : "Login"}
          </span>
        </p>

      </div>
    </div>
  );
}