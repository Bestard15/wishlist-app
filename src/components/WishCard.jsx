import { useState } from "react";
import { fmtPrice, hostnameOf } from "../ui";

export default function WishCard({ item, mode, onEdit, onDelete, onToggleReserved, onToggleDone, style }) {
  const [confirming, setConfirming] = useState(false);
  const reserved = mode === "partner" && item.reserved;
  const done = mode === "idea" && item.done;
  const muted = reserved || done;

  return (
    <div
      style={style}
      className={`relative rounded-blob shadow-card p-5 animate-popIn transition-all hover:-translate-y-0.5 hover:shadow-float ${
        muted ? "bg-success/50 ring-2 ring-success" : "bg-white/90 backdrop-blur"
      }`}
    >
      {reserved && (
        <span className="absolute -top-2.5 right-4 bg-secondary text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-soft -rotate-2">
          ✓ Reservado
        </span>
      )}
      {done && (
        <span className="absolute -top-2.5 right-4 bg-secondary text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-soft -rotate-2">
          🥳 Regalada
        </span>
      )}

      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-2xl ${
            muted
              ? "bg-white/70"
              : item.category === "need"
                ? "bg-sky/40"
                : item.category === "whim"
                  ? "bg-peach/40"
                  : "bg-appbg"
          }`}
        >
          {item.emoji || "🎁"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={`font-bold text-ink truncate ${muted ? "line-through opacity-60" : ""}`}>
              {item.title}
            </p>
            {item.priority > 0 && (
              <span className="text-[11px] shrink-0 tracking-tighter">
                {"❤️".repeat(Math.min(item.priority, 3))}
              </span>
            )}
          </div>

          {item.note && <p className="text-sm text-ink/65 line-clamp-2 mt-0.5">{item.note}</p>}

          {(item.price != null || item.url || item.category) && (
            <div className="flex flex-wrap gap-2 mt-2.5">
              {item.category && (
                <span
                  title={item.category === "need" ? "Necesidad" : "Capricho"}
                  className={`text-xs font-extrabold rounded-full px-2.5 py-1 ${
                    item.category === "need" ? "bg-sky/60" : "bg-peach/60"
                  }`}
                >
                  {item.category === "need" ? "🧦" : "🦄"}
                </span>
              )}
              {item.price != null && (
                <span className="bg-banana/60 text-ink text-xs font-extrabold rounded-full px-3 py-1">
                  {fmtPrice(item.price)} €
                </span>
              )}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white ring-1 ring-ink/10 text-ink/70 hover:ring-secondary hover:text-ink text-xs font-bold rounded-full px-3 py-1 transition-colors max-w-[11rem] truncate"
                >
                  🔗 {hostnameOf(item.url)}
                </a>
              )}
            </div>
          )}
        </div>

        {(mode === "mine" || mode === "idea") && !confirming && (
          <div className="flex gap-1.5 shrink-0">
            {mode === "idea" && (
              <button
                onClick={onToggleDone}
                title={item.done ? "Marcar pendiente" : "¡Ya se la regalé!"}
                aria-label={item.done ? "Marcar pendiente" : "Marcar regalada"}
                className={`w-11 h-11 rounded-full transition-colors ${
                  item.done ? "bg-secondary text-white" : "bg-appbg hover:bg-success/60"
                }`}
              >
                ✓
              </button>
            )}
            <button
              onClick={onEdit}
              className="w-11 h-11 rounded-full bg-appbg hover:bg-banana/50 transition-colors"
              aria-label="Editar"
            >
              ✏️
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="w-11 h-11 rounded-full bg-appbg hover:bg-peach/60 transition-colors"
              aria-label="Eliminar"
            >
              🗑️
            </button>
          </div>
        )}

        {(mode === "mine" || mode === "idea") && confirming && (
          <div className="flex items-center gap-1.5 shrink-0 animate-fadeIn">
            <button
              onClick={onDelete}
              className="bg-primary text-white text-xs font-extrabold rounded-full px-4 py-2 min-h-[44px] shadow-soft active:translate-y-1 active:shadow-none transition-all"
            >
              ¿Borrar?
            </button>
            <button
              onClick={() => setConfirming(false)}
              aria-label="Cancelar"
              className="w-11 h-11 rounded-full bg-appbg text-ink/50 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {mode === "partner" && (
          <button
            onClick={(e) => onToggleReserved(e)}
            className={`shrink-0 self-center rounded-bubble px-4 py-3 font-extrabold text-sm shadow-soft active:translate-y-1 active:shadow-none transition-all ${
              item.reserved
                ? "bg-white/80 text-ink/50"
                : "bg-secondary text-white hover:brightness-105"
            }`}
          >
            {item.reserved ? "Soltar" : "¡Lo pillo! 🎁"}
          </button>
        )}
      </div>
    </div>
  );
}
