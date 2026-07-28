export const WISH_EMOJIS = [
  "🎁", "📚", "👗", "👟", "🎮", "💻", "🧴", "💍",
  "🧸", "✈️", "🍫", "🎟️", "🎧", "⌚", "📱", "💄",
  "👜", "🕶️", "🌸", "🎸", "🎨", "☕", "🍰", "🚲",
  "🏀", "⚽", "🏕️", "🎬", "🪴", "🐾", "🧣", "🛍️"
];

export function toast(message) {
  window.dispatchEvent(new CustomEvent("app:toast", { detail: { message } }));
}

export function burstHearts(x, y) {
  const emojis = ["💕", "💖", "✨", "🎉", "💗"];
  for (let i = 0; i < 12; i++) {
    const el = document.createElement("span");
    el.className = "heart-particle";
    el.textContent = emojis[i % emojis.length];
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.6;
    const dist = 60 + Math.random() * 70;
    el.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    el.style.setProperty("--dy", `${Math.sin(angle) * dist - 40}px`);
    el.style.setProperty("--rot", `${Math.random() * 180 - 90}deg`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 850);
  }
}

export function normalizeUrl(raw) {
  const value = raw.trim();
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export async function hashPin(personId, pin) {
  const data = new TextEncoder().encode(`wishlist:${personId}:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function fmtPrice(n) {
  return n.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}

export function nextOccurrence(dateStr, yearly) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split("-").map(Number);
  let target = new Date(y, m - 1, d);
  if (yearly) {
    target = new Date(today.getFullYear(), m - 1, d);
    if (target < today) target = new Date(today.getFullYear() + 1, m - 1, d);
  }
  return target;
}

export function daysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date - today) / 86400000);
}

export function nearestOccasion(occasions) {
  return occasions
    .map((o) => ({ ...o, days: daysUntil(nextOccurrence(o.date, o.yearly)) }))
    .filter((o) => o.days >= 0)
    .sort((a, b) => a.days - b.days)[0];
}

export function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "enlace";
  }
}
