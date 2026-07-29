import { useState } from "react";
import { fmtPrice, hostnameOf } from "../ui";

export default function WishCard({
  item,
  mode,
  onEdit,
  onDelete,
  onToggleReserved,
  onToggleDone,
  onFulfill,
  onSaveReservedNote,
  occasionsById,
  style
}) {
  const [confirming, setConfirming] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [noteDraft, setNoteDraft] = useState(item.reservedNote || "");
  const reserved = mode === "partner" && item.reserved;
  const done = mode === "idea" && item.done;
  const muted = reserved || done;
  const occasion = item.occasionId && occasionsById ? occasionsById[item.occasionId] : null;
  const showImage = item.image && !imgFailed;

  return (
    <div
      style={style}
      onClick={(e) => {
        if (e.target.closest("button, a, input")) return;
        setExpanded((v) => !v);
      }}
      className={`relative rounded-blob shadow-card p-4 sm:p-5 animate-popIn transition-all hover:-translate-y-0.5 hover:shadow-float cursor-pointer ${
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

      {/* Cabecera: miniatura + título. El resto va a ancho completo debajo. */}
      <div className="flex items-center gap-3.5">
        {showImage && !expanded ? (
          <img
            src={item.image}
            alt=""
            onError={() => setImgFailed(true)}
            className={`w-14 h-14 shrink-0 rounded-2xl object-cover ${muted ? "opacity-60" : ""}`}
          />
        ) : (
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
        )}

        <div className="min-w-0 flex-1 flex items-baseline gap-2">
          <p
            className={`font-bold text-ink leading-snug ${expanded ? "break-words" : "truncate"} ${
              muted ? "line-through opacity-60" : ""
            }`}
          >
            {item.title}
          </p>
          {item.priority > 0 && (
            <span className="text-[11px] shrink-0 tracking-tighter">
              {"❤️".repeat(Math.min(item.priority, 3))}
            </span>
          )}
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? "Contraer detalles" : "Ver detalles"}
          className={`shrink-0 -mr-1 w-8 h-8 rounded-full bg-appbg text-ink/60 text-xs font-bold flex items-center justify-center transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        >
          ▾
        </button>
      </div>

      {expanded && showImage && (
        <img
          src={item.image}
          alt=""
          onError={() => setImgFailed(true)}
          className="w-full max-h-60 object-cover rounded-2xl mt-3.5 animate-fadeIn"
        />
      )}

      {item.note && (
        <p className={`text-sm text-ink/65 mt-2.5 ${expanded ? "" : "line-clamp-2"}`}>
          {item.note}
        </p>
      )}

      {expanded && item.createdAt?.toDate && (
        <p className="text-xs text-ink/45 font-semibold mt-2 animate-fadeIn">
          Apuntado el {item.createdAt.toDate().toLocaleDateString("es-ES")}
        </p>
      )}

      {(item.price != null || item.url || item.category || occasion) && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {occasion && (
            <span className="bg-banana/50 text-ink text-xs font-extrabold rounded-full px-2.5 py-1">
              {occasion.emoji} {occasion.name}
            </span>
          )}
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
              className="bg-white ring-1 ring-ink/10 text-ink/70 hover:ring-secondary hover:text-ink text-xs font-bold rounded-full px-3 py-1 transition-colors max-w-[12rem] truncate"
            >
              🔗 {hostnameOf(item.url)}
            </a>
          )}
        </div>
      )}

      {reserved && !editingNote && (
        <button
          onClick={() => {
            setNoteDraft(item.reservedNote || "");
            setEditingNote(true);
          }}
          className="mt-3 max-w-full truncate text-xs font-bold text-ink/60 bg-white/70 hover:bg-white rounded-full px-3 py-1.5 transition-colors"
        >
          🗒️ {item.reservedNote ? item.reservedNote : "Nota privada..."}
        </button>
      )}
      {reserved && editingNote && (
        <div className="mt-3 flex gap-2">
          <input
            autoFocus
            className="flex-1 min-w-0 rounded-bubble bg-white border-2 border-transparent px-3 py-2 text-base focus:outline-none focus:border-secondary transition-colors"
            placeholder="Comprado, escondido en..."
            value={noteDraft}
            maxLength={120}
            onChange={(e) => setNoteDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSaveReservedNote(noteDraft.trim());
                setEditingNote(false);
              }
            }}
          />
          <button
            onClick={() => {
              onSaveReservedNote(noteDraft.trim());
              setEditingNote(false);
            }}
            className="shrink-0 bg-secondary text-white text-xs font-extrabold rounded-full px-3.5 py-2"
          >
            OK
          </button>
        </div>
      )}

      {/* Acciones en su propia fila: así el texto dispone de todo el ancho */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink/5">
        {(mode === "mine" || mode === "idea") && !confirming && (
          <>
            {mode === "mine" && (
              <button
                onClick={onFulfill}
                title="¡Me lo han regalado!"
                aria-label="Marcar como recibido"
                className="w-11 h-11 rounded-full bg-appbg hover:bg-success/60 transition-colors"
              >
                🎉
              </button>
            )}
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
              className="w-11 h-11 rounded-full bg-appbg hover:bg-peach/60 transition-colors ml-auto"
              aria-label="Eliminar"
            >
              🗑️
            </button>
          </>
        )}

        {(mode === "mine" || mode === "idea") && confirming && (
          <div className="flex items-center gap-2 w-full animate-fadeIn">
            <button
              onClick={onDelete}
              className="flex-1 bg-primary text-white text-sm font-extrabold rounded-bubble px-4 min-h-[44px] shadow-soft active:translate-y-1 active:shadow-none transition-all"
            >
              ¿Borrar de verdad?
            </button>
            <button
              onClick={() => setConfirming(false)}
              aria-label="Cancelar"
              className="w-11 h-11 shrink-0 rounded-full bg-appbg text-ink/50 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {mode === "partner" && (
          <button
            onClick={(e) => onToggleReserved(e)}
            className={`w-full rounded-bubble px-4 min-h-[44px] font-extrabold text-sm shadow-soft active:translate-y-1 active:shadow-none transition-all ${
              item.reserved
                ? "bg-white/80 text-ink/50"
                : "bg-secondary text-white hover:brightness-105"
            }`}
          >
            {item.reserved ? "Soltar reserva" : "¡Lo pillo! 🎁"}
          </button>
        )}
      </div>
    </div>
  );
}
