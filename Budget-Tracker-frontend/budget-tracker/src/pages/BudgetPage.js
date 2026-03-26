import { useState, useEffect } from "react";
import { api, fmt } from "../api";

function getStatusClass(pct) {
  if (pct >= 100) return "fill-over";
  if (pct >= 75) return "fill-warn";
  return "fill-safe";
}

function getStatusText(pct) {
  if (pct >= 100) return { text: "⚠ Over budget!", color: "var(--danger)" };
  if (pct >= 75) return { text: "⚡ Approaching limit", color: "var(--accent2)" };
  return { text: "✓ On track", color: "var(--accent3)" };
}

export default function BudgetPage({ user, expenses, showToast }) {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ month: "", monthLimit: "" });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function loadBudgets() {
    try { setBudgets(await api("/budget")); } catch {}
  }

  useEffect(() => { loadBudgets(); }, []);

  async function handleAdd() {
    if (!form.month || !form.monthLimit) { showToast("Fill in all fields", "error"); return; }
    setLoading(true);
    try {
      await api("/budget", "POST", { month: form.month, monthLimit: parseFloat(form.monthLimit) });
      setForm({ month: "", monthLimit: "" });
      loadBudgets();
      showToast("Budget set!", "success");
    } catch (e) { showToast(e.message, "error"); }
    setLoading(false);
  }

  async function handleDelete(id) {
    try { await api(`/budget/${id}`, "DELETE"); loadBudgets(); showToast("Budget removed", "success"); }
    catch (e) { showToast(e.message, "error"); }
  }

  const myExpenses = expenses.filter((e) => e.user?.userId === user.userId);

  // Get current month default
  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <>
      {/* Set Budget Form */}
      <div className="card mb-20">
        <div className="card-title">➕ Set Monthly Budget</div>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 18 }}>
          Set a total spending limit for a given month. The app will track your expenses against this limit.
        </p>
        <div className="form-row">
          <div className="form-group">
            <label>Month (YYYY-MM)</label>
            <input
              placeholder={currentMonth}
              value={form.month}
              onChange={set("month")}
              maxLength={7}
            />
          </div>
          <div className="form-group">
            <label>Monthly Limit (₹)</label>
            <input type="number" placeholder="15000" min="0" value={form.monthLimit} onChange={set("monthLimit")} />
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={loading}>
          {loading ? "Saving…" : "Set Budget"}
        </button>
      </div>

      {/* Budget List */}
      <div className="card">
        <div className="card-title">📅 Budget Tracking</div>
        {budgets.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📊</div>
            <p>No budgets set. Add your first monthly budget above!</p>
          </div>
        ) : (
          budgets
            .sort((a, b) => b.month.localeCompare(a.month))
            .map((b) => {
              const spent = myExpenses
                .filter((e) => e.spentDate?.startsWith(b.month))
                .reduce((s, e) => s + e.amount, 0);
              const pct = Math.min((spent / b.monthLimit) * 100, 100);
              const displayPct = (spent / b.monthLimit) * 100;
              const status = getStatusText(displayPct);
              const fillClass = getStatusClass(displayPct);

              return (
                <div className="budget-item" key={b.budgetId}>
                  <div className="budget-header">
                    <div className="budget-name">{b.month}</div>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.budgetId)}>
                      Remove
                    </button>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${fillClass}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="budget-meta">
                    <span>Spent: <strong>{fmt(spent)}</strong></span>
                    <span>Limit: <strong>{fmt(b.monthLimit)}</strong></span>
                  </div>
                  <div style={{ fontSize: 12, color: status.color, marginTop: 6, fontWeight: 500 }}>
                    {status.text} &nbsp;({Math.round(displayPct)}% used)
                  </div>
                </div>
              );
            })
        )}
      </div>
    </>
  );
}
