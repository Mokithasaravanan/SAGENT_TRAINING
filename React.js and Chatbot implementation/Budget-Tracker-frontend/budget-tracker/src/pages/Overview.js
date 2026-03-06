import { fmt, tagClass } from "../api";

function StatCard({ label, value, type, icon }) {
  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${type}`}>{fmt(value)}</div>
      <div className="stat-icon">{icon}</div>
    </div>
  );
}

export default function Overview({ user, balance, incomes, expenses }) {
  const myExpenses = expenses
    .filter((e) => e.user?.userId === user.userId)
    .sort((a, b) => new Date(b.spentDate) - new Date(a.spentDate))
    .slice(0, 5);

  const myIncome = incomes
    .filter((i) => i.user?.userId === user.userId)
    .sort((a, b) => new Date(b.incomeDate) - new Date(a.incomeDate))
    .slice(0, 5);

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Total Income"   value={balance?.totalIncome}   type="income"  icon="↑" />
        <StatCard label="Total Expenses" value={balance?.totalExpense}  type="expense" icon="↓" />
        <StatCard label="Net Balance"    value={balance?.balance}       type="balance" icon="◎" />
      </div>

      <div className="overview-grid">
        {/* Recent Expenses */}
        <div className="card">
          <div className="card-title">📊 Recent Expenses</div>
          {myExpenses.length === 0 ? (
            <div className="empty"><div className="empty-icon">🧾</div><p>No expenses logged yet</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Category</th><th>Amount</th><th>Date</th></tr>
              </thead>
              <tbody>
                {myExpenses.map((e) => (
                  <tr key={e.expenseId}>
                    <td><span className={`tag ${tagClass(e.category)}`}>{e.category}</span></td>
                    <td className="text-danger fw-bold">{fmt(e.amount)}</td>
                    <td className="text-muted">{e.spentDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Income */}
        <div className="card">
          <div className="card-title">💼 Recent Income</div>
          {myIncome.length === 0 ? (
            <div className="empty"><div className="empty-icon">💰</div><p>No income added yet</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Source</th><th>Amount</th><th>Date</th></tr>
              </thead>
              <tbody>
                {myIncome.map((i) => (
                  <tr key={i.incomeId}>
                    <td><span className={`tag ${tagClass(i.source)}`}>{i.source}</span></td>
                    <td className="text-success fw-bold">{fmt(i.amount)}</td>
                    <td className="text-muted">{i.incomeDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
