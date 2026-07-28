import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { normalizeUrl, WISH_EMOJIS } from "../ui";

export default function WishModal({ initial, onSave, onClose, kind = "wish", occasions }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    url: initial?.url || "",
    note: initial?.note || "",
    price: initial?.price ?? "",
    emoji: initial?.emoji || "🎁",
    priority: initial?.priority ?? 2,
    category: initial?.category || "whim",
    occasionId: initial?.occasionId || "",
    image: initial?.image || ""
  });
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const titleRef = useRef(null);

  async function fetchPreview() {
    const url = normalizeUrl(form.url);
    if (!url || form.image || previewLoading) return;
    setPreviewLoading(true);
    try {
      const r = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
      if (r.ok) {
        const data = await r.json();
        setForm((f) => ({
          ...f,
          image: data.image || f.image,
          title: f.title.trim() ? f.title : data.title || f.title
        }));
      }
    } catch {
      // En dev no existe /api; en prod, si la tienda bloquea bots, la tarjeta se queda con su emoji
    }
    setPreviewLoading(false);
  }

  useEffect(() => {
    titleRef.current?.focus();
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || saving) return;
    setSaving(true);
    await onSave(form);
  }

  // Portal: un ancestro con transform (fadeSlide de <main>) rompería position:fixed
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full sm:max-w-md bg-white rounded-t-blob sm:rounded-blob shadow-float p-6 sm:p-8 animate-slideUp sm:animate-popIn max-h-[92dvh] overflow-y-auto"
      >
        <div aria-hidden className="sm:hidden mx-auto -mt-1 mb-4 h-1.5 w-12 rounded-full bg-ink/15" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-xl text-ink">
            {kind === "idea"
              ? initial
                ? "Editar idea ✏️"
                : "Idea secreta 💡"
              : initial
                ? "Editar deseo ✏️"
                : "Nuevo deseo ✨"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-11 h-11 rounded-full bg-appbg text-ink/50 font-bold hover:bg-ink/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <label className="block text-xs font-bold uppercase tracking-wide text-ink/55 mb-1.5">
          ¿Qué es?
        </label>
        <input
          ref={titleRef}
          className="w-full mb-4 rounded-bubble bg-appbg border-2 border-transparent px-4 py-3 font-semibold focus:outline-none focus:border-secondary focus:bg-white transition-colors"
          placeholder="Ej: auriculares, ese libro, unas Vans..."
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <label className="block text-xs font-bold uppercase tracking-wide text-ink/55 mb-1.5">
          Emoji
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {WISH_EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => setForm({ ...form, emoji: em })}
              className={`w-11 h-11 rounded-full text-lg transition-all ${
                form.emoji === em
                  ? "bg-secondary/25 ring-2 ring-secondary scale-110"
                  : "bg-appbg hover:bg-sky/40"
              }`}
            >
              {em}
            </button>
          ))}
        </div>

        <label className="block text-xs font-bold uppercase tracking-wide text-ink/55 mb-1.5">
          ¿Necesidad o capricho?
        </label>
        <div className="flex gap-2 mb-4">
          {[
            { key: "need", label: "🧦 Necesidad" },
            { key: "whim", label: "🦄 Capricho" }
          ].map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setForm({ ...form, category: c.key })}
              className={`flex-1 rounded-bubble py-2.5 text-sm font-bold transition-all ${
                form.category === c.key
                  ? "bg-secondary/15 ring-2 ring-secondary text-ink scale-[1.03]"
                  : "bg-appbg text-ink/50 hover:bg-sky/40"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <label className="block text-xs font-bold uppercase tracking-wide text-ink/55 mb-1.5">
          {kind === "idea" ? "¿Cuánto le gustará?" : "¿Cuánta ilusión te hace?"}
        </label>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setForm({ ...form, priority: n })}
              className={`flex-1 rounded-bubble py-2.5 text-sm font-bold transition-all ${
                form.priority === n
                  ? "bg-primary/15 ring-2 ring-primary text-ink scale-[1.03]"
                  : "bg-appbg text-ink/50 hover:bg-peach/40"
              }`}
            >
              {"❤️".repeat(n)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_7rem] gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-ink/55 mb-1.5">
              Enlace <span className="normal-case font-semibold">(opcional)</span>
            </label>
            <input
              className="w-full rounded-bubble bg-appbg border-2 border-transparent px-4 py-3 text-base focus:outline-none focus:border-secondary focus:bg-white transition-colors"
              placeholder="amazon.es/..."
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              onBlur={fetchPreview}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-ink/55 mb-1.5">
              Precio €
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              className="w-full rounded-bubble bg-appbg border-2 border-transparent px-4 py-3 text-base focus:outline-none focus:border-secondary focus:bg-white transition-colors"
              placeholder="~"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
        </div>

        {(previewLoading || form.image) && (
          <div className="flex items-center gap-3 mb-4 bg-appbg/70 rounded-bubble p-3">
            {previewLoading ? (
              <>
                <div className="w-12 h-12 rounded-xl shimmer shrink-0" />
                <p className="text-sm font-bold text-ink/55">Buscando foto del producto...</p>
              </>
            ) : (
              <>
                <img
                  src={form.image}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                  onError={() => setForm((f) => ({ ...f, image: "" }))}
                />
                <p className="flex-1 text-sm font-bold text-ink/55">Foto del enlace 🖼️</p>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image: "" })}
                  className="text-xs font-extrabold text-ink/50 bg-white rounded-full px-3 py-2 hover:bg-peach/40 transition-colors"
                >
                  Quitar
                </button>
              </>
            )}
          </div>
        )}

        {occasions?.length > 0 && (
          <>
            <label className="block text-xs font-bold uppercase tracking-wide text-ink/55 mb-1.5">
              ¿Para qué ocasión?
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => setForm({ ...form, occasionId: "" })}
                className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition-all ${
                  form.occasionId === ""
                    ? "bg-ink text-white scale-105"
                    : "bg-appbg text-ink/55 hover:bg-sky/40"
                }`}
              >
                Sin ocasión
              </button>
              {occasions.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setForm({ ...form, occasionId: o.id })}
                  className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition-all ${
                    form.occasionId === o.id
                      ? "bg-secondary/25 ring-2 ring-secondary text-ink scale-105"
                      : "bg-appbg text-ink/55 hover:bg-sky/40"
                  }`}
                >
                  {o.emoji} {o.name}
                </button>
              ))}
            </div>
          </>
        )}

        <label className="block text-xs font-bold uppercase tracking-wide text-ink/55 mb-1.5">
          Nota <span className="normal-case font-semibold">(talla, color, indirecta...)</span>
        </label>
        <input
          className="w-full mb-6 rounded-bubble bg-appbg border-2 border-transparent px-4 py-3 text-base focus:outline-none focus:border-secondary focus:bg-white transition-colors"
          placeholder="Talla M, el azul mejor 😌"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />

        <button
          type="submit"
          disabled={saving || !form.title.trim()}
          className="w-full bg-primary text-white font-extrabold text-lg rounded-bubble py-3.5 shadow-soft active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving
            ? "Guardando..."
            : initial
              ? "Guardar cambios"
              : kind === "idea"
                ? "Guardar idea 🤫"
                : "Pedir deseo 🌠"}
        </button>
      </form>
    </div>,
    document.body
  );
}
