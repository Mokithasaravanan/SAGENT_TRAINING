import { api, fmt } from "../api";

function getRatioStatus(ratio) {
  if (ratio > 90) return { text: "⚠ High spending — review your budget", color: "var(--danger)" };
  if (ratio > 70) return { text: "⚡ Moderate spending — keep an eye on it", color: "var(--accent2)" };
  if (ratio > 0) return { text: "✓ Healthy spending ratio — great job!", color: "var(--accent3)" };
  return { text: "Add income and expenses to see your ratio", color: "var(--muted)" };
}

export default function BalancePage({ user, balance, onRefresh, showToast }) {
  async function handleRefresh() {
    try {
      await api(`/balance/${user.userId}`, "PUT");
      onRefresh();
      showToast("Balance refreshed!", "success");
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  const ratio = balance
    ? (balance.totalExpense / (balance.totalIncome || 1)) * 100
    : 0;

  const status = getRatioStatus(ratio);
  const fillClass =
    ratio > 90 ? "fill-over" : ratio > 70 ? "fill-warn" : "fill-safe";

  return (
    <>
      {/* Stat Cards */}
      <div className="stats-grid mb-20">
        <div className="stat-card income">
          <div className="stat-label">Total Income</div>
          <div className="stat-value income">{fmt(balance?.totalIncome)}</div>
          <div className="stat-icon">↑</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value expense">{fmt(balance?.totalExpense)}</div>
          <div className="stat-icon">↓</div>
        </div>
        <div className="stat-card balance">
          <div className="stat-label">Net Balance</div>
          <div className="stat-value balance">{fmt(balance?.balance)}</div>
          <div className="stat-icon">◎</div>
        </div>
      </div>

      {/* Ratio Card */}
      <div className="card mb-20">
        <div className="card-title">📊 Expense-to-Income Ratio</div>
        <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 10 }}>
          {Math.round(ratio)}% of your income has been spent
        </div>
        <div className="progress-bar" style={{ height: 14 }}>
          <div
            className={`progress-fill ${fillClass}`}
            style={{ width: `${Math.min(ratio, 100)}%`, borderRadius: 7 }}
          />
        </div>
        <div style={{ marginTop: 12, fontSize: 13, fontWeight: 500, color: status.color }}>
          {status.text}
        </div>
      </div>

      {/* Breakdown */}
      {balance && (
        <div className="card mb-20">
          <div className="card-title">💡 Financial Snapshot</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "var(--surface2)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Savings Rate</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, color: "var(--accent)" }}>
                {balance.totalIncome > 0
                  ? `${Math.round(((balance.totalIncome - balance.totalExpense) / balance.totalIncome) * 100)}%`
                  : "–"}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>of income saved</div>
            </div>
            <div style={{ background: "var(--surface2)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Balance Status</div>
              <div style={{
                fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800,
                color: balance.balance >= 0 ? "var(--accent3)" : "var(--danger)"
              }}>
                {balance.balance >= 0 ? "Positive" : "Negative"}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                {balance.balance >= 0 ? "You're in the green!" : "Spending exceeds income"}
              </div>
            </div>
          </div>
        </div>
      )}

      <button className="btn btn-primary" style={{ width: "auto" }} onClick={handleRefresh}>
        ↻ &nbsp;Refresh Balance
      </button>
    </>
  );
}
