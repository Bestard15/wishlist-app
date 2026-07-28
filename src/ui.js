export const WISH_EMOJIS = ["🎁", "📚", "👗", "👟", "🎮", "💻", "🧴", "💍", "🧸", "✈️", "🍫", "🎟️"];

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

export function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "enlace";
  }
}
