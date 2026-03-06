const BASE = "http://localhost:8081/api";

export async function api(path, method = "GET", body) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json().catch(() => null);
}

export const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export const today = () => new Date().toISOString().split("T")[0];

export const tagClass = (cat) =>
  ({
    Food: "tag-food",
    Travel: "tag-travel",
    Shopping: "tag-shopping",
    Salary: "tag-salary",
    Freelance: "tag-freelance",
    Business: "tag-business",
    Investment: "tag-invest",
  }[cat] || "tag-other");
