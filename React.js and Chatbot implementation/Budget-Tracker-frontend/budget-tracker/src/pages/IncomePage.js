import { useState } from "react";
import { api, fmt, tagClass, today } from "../api";

const SOURCES = ["Salary", "Freelance", "Business", "Investment", "Rental", "Other"];

export default function IncomePage({ user, incomes, onRefresh, showToast }) {
  const [form, setForm] = useState({ source: "Salary", amount: "", incomeDate: today() });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleAdd() {
    if (!form.amount) { showToast("Please enter an amount", "error"); return; }
    setLoading(true);
    try {
      await api("/income", "POST", {
        source: form.source,
        amount: parseFloat(form.amount),
        incomeDate: form.incomeDate,
        user: { userId: user.userId },
      });
      setForm({ source: "Salary", amount: "", incomeDate: today() });
      onRefresh();
      showToast("Income added successfully!", "success");
    } catch (e) {
      showToast(e.message, "error");
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    try {
      await api(`/income/${id}`, "DELETE");
      onRefresh();
      showToast("Income entry deleted", "success");
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  const myIncome = incomes
    .filter((i) => i.user?.userId === user.userId)
    .sort((a, b) => new Date(b.incomeDate) - new Date(a.incomeDate));

  const total = myIncome.reduce((s, i) => s + i.amount, 0);

  return (
    <>
      {/* Add Income Form */}
      <div className="card mb-20">
        <div className="card-title">➕ Add Income</div>
        <div className="form-row">
          <div className="form-group">
            <label>Source</label>
            <select value={form.source} onChange={set("source")}>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input type="number" placeholder="0.00" min="0" value={form.amount} onChange={set("amount")} />
          </div>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={form.incomeDate} onChange={set("incomeDate")} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={loading}>
          {loading ? "Saving…" : "Add Income"}
        </button>
      </div>

      {/* Income History */}
      <div className="card">
        <div className="card-title flex-between" style={{ display: "flex" }}>
          <span>📋 Income History</span>
          {myIncome.length > 0 && (
            <span style={{ fontSize: 14, fontWeight: 400, color: "var(--accent3)" }}>
              Total: {fmt(total)}
            </span>
          )}
        </div>

        {myIncome.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">💰</div>
            <p>No income recorded yet. Add your first entry above!</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myIncome.map((i) => (
                <tr key={i.incomeId}>
                  <td><span className={`tag ${tagClass(i.source)}`}>{i.source}</span></td>
                  <td className="text-success fw-bold">{fmt(i.amount)}</td>
                  <td className="text-muted">{i.incomeDate}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(i.incomeId)}>
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
