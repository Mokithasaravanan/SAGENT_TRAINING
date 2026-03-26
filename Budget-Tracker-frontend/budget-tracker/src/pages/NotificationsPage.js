import { useState, useEffect } from "react";
import { api, today } from "../api";

export default function NotificationsPage({ user, showToast }) {
  const [notifs, setNotifs] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadNotifs() {
    try { setNotifs(await api("/notifications")); } catch {}
  }

  useEffect(() => { loadNotifs(); }, []);

  async function handleAdd() {
    if (!message.trim()) { showToast("Enter a message", "error"); return; }
    setLoading(true);
    try {
      await api("/notifications", "POST", {
        message,
        sentDate: today(),
        user: { userId: user.userId },
      });
      setMessage("");
      loadNotifs();
      showToast("Note saved!", "success");
    } catch (e) { showToast(e.message, "error"); }
    setLoading(false);
  }

  async function handleDelete(id) {
    try { await api(`/notifications/${id}`, "DELETE"); loadNotifs(); showToast("Deleted", "success"); }
    catch (e) { showToast(e.message, "error"); }
  }

  const mine = notifs
    .filter((n) => n.user?.userId === user.userId)
    .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));

  return (
    <>
      <div className="card mb-20">
        <div className="card-title">➕ Add Note / Reminder</div>
        <div className="form-group">
          <label>Message</label>
          <input
            placeholder="e.g. Salary credited, EMI due on 5th, Rent paid…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={loading}>
          {loading ? "Saving…" : "Save Note"}
        </button>
      </div>

      <div className="card">
        <div className="card-title">🔔 My Notes & Reminders</div>
        {mine.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔔</div>
            <p>No notes yet. Add a reminder or financial note above!</p>
          </div>
        ) : (
          mine.map((n) => (
            <div className="notif-item" key={n.notificationId}>
              <div className="notif-dot" />
              <div style={{ flex: 1 }}>
                <div className="notif-msg">{n.message}</div>
                <div className="notif-date">{n.sentDate}</div>
              </div>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(n.notificationId)}>
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
