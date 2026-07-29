const mq = window.matchMedia("(prefers-color-scheme: dark)");

export function isDark() {
  const t = localStorage.getItem("theme");
  return t === "dark" || (t !== "light" && mq.matches);
}

export function applyTheme() {
  const dark = isDark();
  document.documentElement.classList.toggle("dark", dark);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = dark ? "#141920" : "#F7F9FC";
  window.dispatchEvent(new CustomEvent("themechange", { detail: { dark } }));
}

export function toggleTheme() {
  localStorage.setItem("theme", isDark() ? "light" : "dark");
  applyTheme();
}

// Mientras no haya elección manual, sigue al sistema en vivo
mq.addEventListener("change", () => {
  if (!localStorage.getItem("theme")) applyTheme();
});
