const NAV_ITEMS = [
  { id: "overview",       icon: "⬡", label: "Overview" },
  { id: "income",         icon: "↑", label: "Income" },
  { id: "expenses",       icon: "↓", label: "Expenses" },
  { id: "budget",         icon: "◉", label: "Budget" },
  { id: "goals",          icon: "◎", label: "Goals" },
  { id: "balance",        icon: "⊕", label: "Balance" },
  { id: "notifications",  icon: "◈", label: "Notifications" },
];

export default function Sidebar({ user, page, setPage, onLogout }) {
  const initials = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">💰</span>
        <span className="sidebar-name">Smart<em>Budget</em></span>
      </div>

      <div>
        <div className="nav-label">Navigation</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.designation || user.email}</div>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Sign out">⇥</button>
        </div>
      </div>
    </aside>
  );
}
