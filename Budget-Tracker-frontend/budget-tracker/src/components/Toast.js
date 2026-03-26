import { useEffect } from "react";

export default function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      <span className="toast-icon">{type === "success" ? "✓" : "✕"}</span>
      {msg}
    </div>
  );
}
