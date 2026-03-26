import { useState } from "react";
import { api, fmt, tagClass, today } from "../api";

const CATEGORIES = ["Food", "Travel", "Shopping", "Entertainment", "Health", "Utilities", "Education", "Other"];

export default function ExpensePage({ user, expenses, onRefresh, showToast }) {
  const [form, setForm] = useState({ category: "Food", amount: "", spentDate: today() });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleAdd() {
    if (!form.amount) { showToast("Please enter an amount", "error"); return; }
    setLoading(true);
    try {
      await api("/expense", "POST", {
        category: form.category,
        amount: parseFloat(form.amount),
        spentDate: form.spentDate,
        user: { userId: user.userId },
      });
      setForm({ category: "Food", amount: "", spentDate: today() });
      onRefresh();
      showToast("Expense logged!", "success");
    } catch (e) {
      showToast(e.message, "error");
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    try {
      await api(`/expense/${id}`, "DELETE");
      onRefresh();
      showToast("Expense deleted", "success");
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  const myExpenses = expenses
    .filter((e) => e.user?.userId === user.userId)
    .sort((a, b) => new Date(b.spentDate) - new Date(a.spentDate));

  // Category breakdown
  const catTotals = myExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <>
      {/* Log Expense Form */}
      <div className="card mb-20">
        <div className="card-title">➕ Log Expense</div>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input type="number" placeholder="0.00" min="0" value={form.amount} onChange={set("amount")} />
          </div>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={form.spentDate} onChange={set("spentDate")} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={loading}>
          {loading ? "Saving…" : "Log Expense"}
        </button>
      </div>

      {/* Category Breakdown */}
      {Object.keys(catTotals).length > 0 && (
        <div className="card mb-20">
          <div className="card-title">📈 Spending by Category</div>
          <div className="cat-grid">
            {Object.entries(catTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, total]) => (
                <div className="cat-box" key={cat}>
                  <div className="cat-box-label">{cat}</div>
                  <div className="cat-box-value">{fmt(total)}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Expense History */}
      <div className="card">
        <div className="card-title">📋 Expense History</div>
        {myExpenses.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🧾</div>
            <p>No expenses logged yet. Add one above!</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myExpenses.map((e) => (
                <tr key={e.expenseId}>
                  <td><span className={`tag ${tagClass(e.category)}`}>{e.category}</span></td>
                  <td className="text-danger fw-bold">{fmt(e.amount)}</td>
                  <td className="text-muted">{e.spentDate}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(e.expenseId)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
