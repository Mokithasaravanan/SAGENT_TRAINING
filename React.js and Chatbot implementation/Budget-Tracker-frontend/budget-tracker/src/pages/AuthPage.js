import { useState } from "react";
import { api } from "../api";

const FEATURES = [
  "Track income & expenses in real-time",
  "Set monthly budget limits per category",
  "Monitor savings goal progress",
  "Instant balance & spending insights",
];

export default function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phNo: "", designation: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        const user = await api("/users/login", "POST", {
          email: form.email,
          password: form.password,
        });
        onLogin(user);
      } else {
        await api("/users", "POST", form);
        setTab("login");
        setError("✓ Account created! Please sign in.");
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className="auth-wrap">
      {/* Left panel */}
      <div className="auth-left">
        <div className="brand">
          <div className="brand-icon">💰</div>
          <h1>
            Smart<br />
            <span>Budget</span><br />
            Tracker
          </h1>
          <p>Take control of your finances. Track income, expenses, and reach your savings goals effortlessly.</p>
        </div>
        <div className="feature-list">
          {FEATURES.map((f) => (
            <div className="feature-item" key={f}>
              <div className="feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => { setTab("login"); setError(""); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${tab === "register" ? "active" : ""}`}
              onClick={() => { setTab("register"); setError(""); }}
            >
              Create Account
            </button>
          </div>

          <div className="auth-title">
            {tab === "login" ? "Welcome back" : "Get started"}
          </div>
          <div className="auth-subtitle">
            {tab === "login"
              ? "Sign in to your budget tracker"
              : "Create your free account today"}
          </div>

          {tab === "register" && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input placeholder="John Doe" value={form.name} onChange={set("name")} onKeyDown={handleKey} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input placeholder="+91 98765 43210" value={form.phNo} onChange={set("phNo")} onKeyDown={handleKey} />
                </div>
              </div>
              <div className="form-group">
                <label>Designation</label>
                <input placeholder="Software Engineer" value={form.designation} onChange={set("designation")} onKeyDown={handleKey} />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} onKeyDown={handleKey} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={handleKey} />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div style={{ marginTop: 24 }}>
            <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}>
              {loading ? "Please wait…" : tab === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
