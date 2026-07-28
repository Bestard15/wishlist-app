import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { daysUntil, nextOccurrence, toast } from "../ui";

const OCCASIONS = collection(db, "occasions");
const OCCASION_EMOJIS = ["🎂", "💍", "🎄", "👑", "❤️", "🎓", "🍼", "✨"];
const QUICK_ADDS = [
  { name: "Navidad", emoji: "🎄", date: "2026-12-25", yearly: true },
  { name: "Reyes Magos", emoji: "👑", date: "2026-01-06", yearly: true }
];

export default function OccasionsModal({ occasions, onClose }) {
  const [form, setForm] = useState({ name: "", emoji: "🎂", date: "", yearly: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function addOccasion(data) {
    setSaving(true);
    await addDoc(OCCASIONS, { ...data, createdAt: serverTimestamp() });
    toast(`${data.emoji} ${data.name} añadida`);
    setSaving(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.date || saving) return;
    await addOccasion({
      name: form.name.trim(),
      emoji: form.emoji,
      date: form.date,
      yearly: form.yearly
    });
    setForm({ name: "", emoji: "🎂", date: "", yearly: true });
  }

  const rows = occasions
    .map((o) => ({ ...o, days: daysUntil(nextOccurrence(o.date, o.yearly)) }))
    .sort((a, b) => (a.days < 0 ? 999 : a.days) - (b.days < 0 ? 999 : b.days));

  const missingQuick = QUICK_ADDS.filter(
    (q) => !occasions.some((o) => o.name.toLowerCase() === q.name.toLowerCase())
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-blob sm:rounded-blob shadow-float p-6 sm:p-8 animate-slideUp sm:animate-popIn max-h-[92dvh] overflow-y-auto">
        <div aria-hidden className="sm:hidden mx-auto -mt-1 mb-4 h-1.5 w-12 rounded-full bg-ink/15" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-xl text-ink">Vuestras ocasiones 🎂</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-11 h-11 rounded-full bg-appbg text-ink/50 font-bold hover:bg-ink/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {rows.length === 0 && (
          <p className="text-ink/60 text-sm mb-4">
            Añadid cumpleaños, aniversario y fiestas — los deseos se podrán etiquetar
            para cada ocasión y la app os avisará de lo que se acerca.
          </p>
        )}

        <div className="flex flex-col gap-2 mb-5">
          {rows.map((o) => (
            <div
              key={o.id}
              className="flex items-center gap-3 bg-appbg/70 rounded-bubble px-4 py-3"
            >
              <span className="text-2xl">{o.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink truncate">{o.name}</p>
                <p className="text-xs text-ink/55 font-semibold">
                  {o.days < 0
                    ? "Ya pasó"
                    : o.days === 0
                      ? "¡Es hoy! 🎉"
                      : `En ${o.days} ${o.days === 1 ? "día" : "días"}`}
                  {o.yearly ? " · cada año" : ""}
                </p>
              </div>
              <button
                onClick={async () => {
                  await deleteDoc(doc(db, "occasions", o.id));
                  toast("Ocasión eliminada 🗑️");
                }}
                aria-label={`Eliminar ${o.name}`}
                className="w-11 h-11 rounded-full bg-white hover:bg-peach/50 transition-colors"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {missingQuick.length > 0 && (
          <div className="flex gap-2 mb-5 flex-wrap">
            {missingQuick.map((q) => (
              <button
                key={q.name}
                disabled={saving}
                onClick={() => addOccasion(q)}
                className="bg-sky/50 hover:bg-sky/70 text-ink text-sm font-extrabold rounded-full px-4 py-2.5 transition-colors disabled:opacity-40"
              >
                ＋ {q.emoji} {q.name}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-appbg/70 rounded-bubble p-4">
          <p className="font-extrabold text-ink mb-3">Nueva ocasión</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {OCCASION_EMOJIS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setForm({ ...form, emoji: em })}
                className={`w-11 h-11 rounded-full text-lg transition-all ${
                  form.emoji === em
                    ? "bg-secondary/25 ring-2 ring-secondary scale-110"
                    : "bg-white hover:bg-sky/40"
                }`}
              >
                {em}
              </button>
            ))}
          </div>
          <input
            className="w-full mb-3 rounded-bubble bg-white border-2 border-transparent px-4 py-3 text-base font-semibold focus:outline-none focus:border-secondary transition-colors"
            placeholder="Cumple de Reyes, aniversario..."
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="flex gap-3 mb-3 items-center">
            <input
              type="date"
              className="flex-1 rounded-bubble bg-white border-2 border-transparent px-4 py-3 text-base font-semibold focus:outline-none focus:border-secondary transition-colors"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm font-bold text-ink/70 shrink-0">
              <input
                type="checkbox"
                checked={form.yearly}
                onChange={(e) => setForm({ ...form, yearly: e.target.checked })}
                className="w-5 h-5 accent-[#FF6B6B]"
              />
              Cada año
            </label>
          </div>
          <button
            type="submit"
            disabled={saving || !form.name.trim() || !form.date}
            className="w-full bg-primary text-white font-extrabold rounded-bubble py-3 shadow-soft active:translate-y-1 active:shadow-none transition-all disabled:opacity-40"
          >
            Añadir ocasión
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
