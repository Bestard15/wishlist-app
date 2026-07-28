import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "../firebase";
import { burstHearts, fmtPrice, nearestOccasion, toast } from "../ui";
import ListControls, { matchesPrice, sortItems } from "./ListControls";
import { SkeletonCard } from "./MyWishlist";
import WishCard from "./WishCard";

const ITEMS = collection(db, "items");

export default function PartnerWishlist({
  partnerId,
  partnerName,
  occasions,
  occasionsById,
  partnerInfo
}) {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("all");
  const [price, setPrice] = useState("any");
  const [sort, setSort] = useState("hearts");
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const q = query(ITEMS, where("owner", "==", partnerId));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [partnerId]);

  async function toggleReserved(item, e) {
    if (!item.reserved) {
      burstHearts(e.clientX, e.clientY);
      toast("¡Regalo pillado! 🤫");
      await updateDoc(doc(db, "items", item.id), { reserved: true });
    } else {
      toast("Reserva soltada 👌");
      await updateDoc(doc(db, "items", item.id), { reserved: false, reservedNote: "" });
    }
  }

  async function saveReservedNote(item, note) {
    await updateDoc(doc(db, "items", item.id), { reservedNote: note });
    toast("Nota guardada 🗒️");
  }

  const active = items?.filter((i) => !i.fulfilledAt) ?? null;
  const reservedCount = active?.filter((i) => i.reserved).length ?? 0;
  const visible = active
    ? sortItems(
        active.filter((i) => (filter === "all" || i.category === filter) && matchesPrice(i, price)),
        sort
      )
    : null;
  const totalPrice = visible?.reduce((sum, i) => sum + (i.price || 0), 0) ?? 0;

  const next = occasions?.length ? nearestOccasion(occasions) : null;
  const reservedForNext = next
    ? (active ?? []).filter((i) => i.occasionId === next.id && i.reserved).length
    : 0;
  const infoFields = [
    ["👕 Ropa", partnerInfo?.ropa],
    ["👟 Calzado", partnerInfo?.calzado],
    ["💍 Anillo", partnerInfo?.anillo],
    ["🎨 Le gusta", partnerInfo?.gustos],
    ["🚫 Ni se te ocurra", partnerInfo?.vetado]
  ].filter(([, v]) => v && v.trim());

  return (
    <div className="max-w-2xl mx-auto">
      {items === null && (
        <div className="flex flex-col gap-3">
          <div className="rounded-bubble shadow-card p-5 bg-white">
            <div className="h-2.5 rounded-full shimmer" />
          </div>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {active?.length === 0 && (
        <div className="text-center py-14 animate-popIn">
          <div className="text-6xl mb-4 inline-block">🕵️</div>
          <p className="font-extrabold text-xl text-ink mb-1">
            {partnerName} aún no ha pedido nada
          </p>
          <p className="text-ink/50 max-w-xs mx-auto">
            Dale un toque para que apunte sus caprichos 😏
          </p>
        </div>
      )}

      {active?.length > 0 && (
        <>
          <ListControls
            filter={filter}
            onFilter={setFilter}
            price={price}
            onPrice={setPrice}
            sort={sort}
            onSort={setSort}
          />

          <div className="bg-white/80 backdrop-blur rounded-bubble shadow-card px-5 py-4 mb-4 animate-popIn">
            <div className="flex items-center justify-between gap-2 text-sm font-bold text-ink/70 mb-2">
              <span>
                {visible.length} {visible.length === 1 ? "deseo" : "deseos"} 🎀
              </span>
              {totalPrice > 0 && (
                <span className="text-ink/55 text-xs">~{fmtPrice(totalPrice)} €</span>
              )}
              <span>
                {reservedCount} {reservedCount === 1 ? "pillado" : "pillados"} 🤫
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-appbg overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-secondary to-success transition-all duration-500"
                style={{ width: `${(reservedCount / active.length) * 100}%` }}
              />
            </div>
            {next && next.days <= 60 && (
              <p className="text-xs font-bold text-ink/60 mt-2.5 text-center">
                {next.emoji} {next.name}{" "}
                {next.days === 0 ? "¡es HOY!" : `en ${next.days} ${next.days === 1 ? "día" : "días"}`}
                {reservedForNext > 0
                  ? ` — ${reservedForNext} ${reservedForNext === 1 ? "regalo pillado" : "regalos pillados"} 🎯`
                  : " — y no has reservado nada 👀"}
              </p>
            )}
          </div>

          {infoFields.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="w-full bg-white/80 backdrop-blur rounded-bubble shadow-card px-5 py-3 font-extrabold text-sm text-ink/70 hover:text-ink transition-colors text-left flex justify-between items-center"
              >
                <span>📏 Tallas y gustos de {partnerName}</span>
                <span className={`transition-transform ${showInfo ? "rotate-180" : ""}`}>▾</span>
              </button>
              {showInfo && (
                <div className="bg-white/80 backdrop-blur rounded-bubble shadow-card px-5 py-4 mt-2 animate-popIn flex flex-col gap-2">
                  {infoFields.map(([label, value]) => (
                    <p key={label} className="text-sm">
                      <span className="font-extrabold text-ink/60">{label}:</span>{" "}
                      <span className="font-semibold text-ink">{value}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {visible.length === 0 && (
            <p className="text-center text-ink/55 font-semibold py-10 animate-popIn">
              Nada por aquí con este filtro 🤷
            </p>
          )}

          <div className="flex flex-col gap-3">
            {visible.map((item, i) => (
              <WishCard
                key={item.id}
                item={item}
                mode="partner"
                occasionsById={occasionsById}
                style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                onToggleReserved={(e) => toggleReserved(item, e)}
                onSaveReservedNote={(note) => saveReservedNote(item, note)}
              />
            ))}
          </div>

          <p className="text-center text-xs text-ink/55 mt-6 px-6">
            Tranqui: {partnerName} no ve qué está reservado — la sorpresa está a salvo 🤐
          </p>
        </>
      )}
    </div>
  );
}
