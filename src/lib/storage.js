// ─── Unique ID generator ──────────────────────────────────────────────────────
let _id = Date.now();
export const uid = () => String(++_id);

const KEY = "kidsTreeData_v3";
const OLD_KEY = "kidsTreeData_v2";

// ─── Save tree to localStorage (+ optional window.storage bridge) ─────────────
export async function saveTree(data) {
  const json = JSON.stringify(data);
  try { await window.storage?.set(KEY, json); } catch (_) {}
  try { localStorage.setItem(KEY, json); } catch (_) {}
}

// ─── Load tree from localStorage (with migration from old key) ────────────────
export async function loadTree() {
  // Try window.storage bridge first (native app WebViews)
  try {
    const r = await window.storage?.get(KEY);
    if (r?.value) return JSON.parse(r.value);
  } catch (_) {}

  // localStorage current key
  try {
    const s = localStorage.getItem(KEY);
    if (s) return JSON.parse(s);
  } catch (_) {}

  // Migrate from old key
  try {
    const s = localStorage.getItem(OLD_KEY);
    if (s) return JSON.parse(s);
  } catch (_) {}

  return null;
}

// ─── Clear all saved data ─────────────────────────────────────────────────────
export function clearTree() {
  try { localStorage.removeItem(KEY); } catch (_) {}
  try { localStorage.removeItem(OLD_KEY); } catch (_) {}
  try { localStorage.removeItem("magic_tour_done"); } catch (_) {}
}
