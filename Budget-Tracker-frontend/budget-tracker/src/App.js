import { useState, useCallback } from "react";
import "./styles.css";
import { api } from "./api";
import Chatbot from './components/Chatbot';

const PAGES = ["overview", "income", "expenses", "budget", "goals", "balance", "notifications"];

import AuthPage from "./pages/AuthPage";
import Overview from "./pages/Overview";
import IncomePage from "./pages/IncomePage";
import ExpensePage from "./pages/ExpensePage";
import BudgetPage from "./pages/BudgetPage";
import GoalsPage from "./pages/GoalsPage";
import BalancePage from "./pages/BalancePage";
import NotificationsPage from "./pages/NotificationsPage";

import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";

const PAGE_META = {
  overview:      { title: "Dashboard",      sub: "Your financial snapshot at a glance",         icon: "⬡" },
  income:        { title: "Income",          sub: "Record and track your earnings",               icon: "💰" },
  expenses:      { title: "Expenses",        sub: "Monitor and categorize your spending",         icon: "🧾" },
  budget:        { title: "Budget",          sub: "Set monthly spending limits",                  icon: "📅" },
  goals:         { title: "Savings Goals",   sub: "Track progress toward your financial goals",   icon: "🎯" },
  balance:       { title: "Balance",         sub: "Your net financial position",                  icon: "⚖️" },
  notifications: { title: "Notifications",   sub: "Personal notes and financial reminders",       icon: "🔔" },
};

export default function App() {
  const [user, setUser]       = useState(null);
  const [page, setPage]       = useState("overview");
  const [balance, setBalance] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [toast, setToast]     = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
  }, []);

  async function loadAll(u) {
    const uid = u?.userId;
    if (!uid) return;
    try {
      const [bal, inc, exp] = await Promise.allSettled([
        api(`/balance/${uid}`),
        api("/income"),
        api("/expense"),
      ]);
      if (bal.status === "fulfilled") setBalance(bal.value);
      if (inc.status === "fulfilled") setIncomes(inc.value || []);
      if (exp.status === "fulfilled") setExpenses(exp.value || []);
    } catch {}
  }

  function handleLogin(u) {
    setUser(u);
    loadAll(u);
  }

  function handleLogout() {
    setUser(null);
    setBalance(null);
    setIncomes([]);
    setExpenses([]);
    setPage("overview");
  }

  const handleRefresh = useCallback(() => loadAll(user), [user]);
  const meta = PAGE_META[page];

  const currentIndex = PAGES.indexOf(page);
  const prevPage = currentIndex > 0 ? PAGES[currentIndex - 1] : null;
  const nextPage = currentIndex < PAGES.length - 1 ? PAGES[currentIndex + 1] : null;

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <div className="dashboard">
        <Sidebar
          user={user}
          page={page}
          setPage={setPage}
          onLogout={handleLogout}
        />

        <main className="main">
          {/* Page Banner */}
          <div className={`page-banner banner-${page}`}>
            <div className="banner-overlay" />
            <div className="banner-content">
              <div className="banner-icon">{meta.icon}</div>
              <div>
                <div className="page-title">{meta.title}</div>
                <div className="page-sub">{meta.sub}</div>
              </div>
            </div>
            <div className="page-nav-btns">
              <button
                className="nav-btn"
                onClick={() => prevPage && setPage(prevPage)}
                disabled={!prevPage}
                title={prevPage ? PAGE_META[prevPage].title : ""}
              >
                ← {prevPage ? PAGE_META[prevPage].title : ""}
              </button>
              <div className="page-dots">
                {PAGES.map((p) => (
                  <div
                    key={p}
                    className={`page-dot ${p === page ? "active" : ""}`}
                    onClick={() => setPage(p)}
                    title={PAGE_META[p].title}
                  />
                ))}
              </div>
              <button
                className="nav-btn"
                onClick={() => nextPage && setPage(nextPage)}
                disabled={!nextPage}
                title={nextPage ? PAGE_META[nextPage].title : ""}
              >
                {nextPage ? PAGE_META[nextPage].title : ""} →
              </button>
            </div>
          </div>

          <div className="content">
            {page === "overview" && (
              <Overview
                user={user}
                balance={balance}
                incomes={incomes}
                expenses={expenses}
              />
            )}
            {page === "income" && (
              <IncomePage
                user={user}
                incomes={incomes}
                onRefresh={handleRefresh}
                showToast={showToast}
              />
            )}
            {page === "expenses" && (
              <ExpensePage
                user={user}
                expenses={expenses}
                onRefresh={handleRefresh}
                showToast={showToast}
              />
            )}
            {page === "budget" && (
              <BudgetPage
                user={user}
                expenses={expenses}
                showToast={showToast}
              />
            )}
            {page === "goals" && (
              <GoalsPage
                user={user}
                showToast={showToast}
              />
            )}
            {page === "balance" && (
              <BalancePage
                user={user}
                balance={balance}
                onRefresh={handleRefresh}
                showToast={showToast}
              />
            )}
            {page === "notifications" && (
              <NotificationsPage
                user={user}
                showToast={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Chatbot user={user} />
    </div>
  );
}