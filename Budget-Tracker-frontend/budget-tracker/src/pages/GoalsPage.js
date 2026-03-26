import { useState, useEffect } from "react";
import { api, fmt } from "../api";

export default function GoalsPage({ user, showToast }) {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ goalName: "", targetAmount: "", currentAmount: "" });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function loadGoals() {
    try { setGoals(await api(`/goals/${user.userId}`)); } catch {}
  }

  useEffect(() => { loadGoals(); }, [user.userId]);

  async function handleAdd() {
    if (!form.goalName || !form.targetAmount) { showToast("Fill in goal name and target", "error"); return; }
    setLoading(true);
    try {
      await api(`/goals/${user.userId}`, "POST", {
        goalName: form.goalName,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount || 0),
      });
      setForm({ goalName: "", targetAmount: "", currentAmount: "" });
      loadGoals();
      showToast("Goal added!", "success");
    } catch (e) { showToast(e.message, "error"); }
    setLoading(false);
  }

  async function handleDelete(id) {
    try { await api(`/goals/${id}`, "DELETE"); loadGoals(); showToast("Goal removed", "success"); }
    catch (e) { showToast(e.message, "error"); }
  }

  return (
    <>
      {/* Add Goal Form */}
      <div className="card mb-20">
        <div className="card-title">🎯 New Savings Goal</div>
        <div className="form-group">
          <label>Goal Name</label>
          <input
            placeholder="e.g. Vacation Fund, Emergency Savings, New Laptop…"
            value={form.goalName}
            onChange={set("goalName")}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Target Amount (₹)</label>
            <input type="number" placeholder="50000" min="0" value={form.targetAmount} onChange={set("targetAmount")} />
          </div>
          <div className="form-group">
            <label>Already Saved (₹)</label>
            <input type="number" placeholder="0" min="0" value={form.currentAmount} onChange={set("currentAmount")} />
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={loading}>
          {loading ? "Saving…" : "Add Goal"}
        </button>
      </div>

      {/* Goals List */}
      <div className="card">
        <div className="card-title">🏆 My Savings Goals</div>
        {goals.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🎯</div>
            <p>No goals yet. Set your first savings goal above!</p>
          </div>
        ) : (
          goals.map((g) => {
            const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
            const remaining = g.targetAmount - g.currentAmount;
            const done = pct >= 100;

            return (
              <div className="goal-card" key={g.goalId}>
                <div className="goal-header">
                  <div>
                    <div className="goal-name">{g.goalName}</div>
                    <div className="goal-sub">
                      {fmt(g.currentAmount)} saved of {fmt(g.targetAmount)}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="goal-pct">{Math.round(pct)}%</span>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(g.goalId)}>✕</button>
                  </div>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill fill-safe"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div style={{ fontSize: 13, marginTop: 6 }}>
                  {done ? (
                    <span style={{ color: "var(--accent3)", fontWeight: 600 }}>🎉 Goal reached! Congratulations!</span>
                  ) : (
                    <span className="text-muted">{fmt(remaining)} more to go</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
