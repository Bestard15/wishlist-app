import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { fmtPrice, toast } from "../ui";
import Avatar from "./Avatar";

const ITEMS = collection(db, "items");

export default function HistoryModal({ couple, onClose }) {
  const [fulfilled, setFulfilled] = useState(null);

  useEffect(() => {
    return onSnapshot(ITEMS, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((i) => i.fulfilledAt);
      list.sort(
        (a, b) => (b.fulfilledAt?.toMillis?.() ?? 0) - (a.fulfilledAt?.toMillis?.() ?? 0)
      );
      setFulfilled(list);
    });
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const total = fulfilled?.reduce((s, i) => s + (i.price || 0), 0) ?? 0;

  function daysListed(item) {
    if (!item.createdAt?.toMillis || !item.fulfilledAt?.toMillis) return null;
    return Math.max(
      0,
      Math.round((item.fulfilledAt.toMillis() - item.createdAt.toMillis()) / 86400000)
    );
  }

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
          <h2 className="font-extrabold text-xl text-ink">Salón de la fama 🏆</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-11 h-11 rounded-full bg-appbg text-ink/50 font-bold hover:bg-ink/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {fulfilled === null && <p className="text-ink/55 font-semibold">Cargando...</p>}

        {fulfilled?.length === 0 && (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">🗃️</div>
            <p className="font-extrabold text-ink mb-1">Aún no hay regalos cumplidos</p>
            <p className="text-sm text-ink/60 max-w-xs mx-auto">
              Cuando recibas un deseo de tu lista, márcalo con 🎉 y quedará aquí para
              siempre.
            </p>
          </div>
        )}

        {fulfilled?.length > 0 && (
          <>
            <div className="bg-banana/40 rounded-bubble px-5 py-3 mb-4 text-center">
              <p className="font-extrabold text-ink">
                {fulfilled.length} {fulfilled.length === 1 ? "regalo" : "regalos"}
                {total > 0 && <> · ~{fmtPrice(total)} €</>}
              </p>
              <p className="text-xs text-ink/60 font-semibold">
                invertidos en hacer feliz al otro 💘
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {fulfilled.map((item) => {
                const days = daysListed(item);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-appbg/70 rounded-bubble px-4 py-3"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="w-11 h-11 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <span className="text-2xl shrink-0">{item.emoji || "🎁"}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-ink truncate">{item.title}</p>
                      <p className="text-xs text-ink/55 font-semibold flex items-center gap-1 flex-wrap">
                        <Avatar
                          personId={item.owner}
                          name={couple[item.owner]}
                          avatar={couple[`${item.owner}Avatar`]}
                          size="sm"
                          className="!w-4 !h-4 !text-[9px]"
                        />
                        {couple[item.owner]}
                        {item.fulfilledAt?.toDate && (
                          <> · {item.fulfilledAt.toDate().toLocaleDateString("es-ES")}</>
                        )}
                        {days != null && days > 0 && <> · {days} días soñándolo</>}
                        {item.price != null && <> · {fmtPrice(item.price)} €</>}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        await updateDoc(doc(db, "items", item.id), { fulfilledAt: null });
                        toast("De vuelta a la lista ↩️");
                      }}
                      title="Devolver a la lista"
                      aria-label="Devolver a la lista"
                      className="w-11 h-11 rounded-full bg-white hover:bg-sky/50 transition-colors shrink-0"
                    >
                      ↩️
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
