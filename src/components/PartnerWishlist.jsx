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
import { burstHearts, fmtPrice, toast } from "../ui";
import FilterPills from "./FilterPills";
import { SkeletonCard } from "./MyWishlist";
import WishCard from "./WishCard";

const ITEMS = collection(db, "items");

export default function PartnerWishlist({ partnerId, partnerName }) {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const q = query(ITEMS, where("owner", "==", partnerId));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Lo que más ilusión le hace primero, luego lo más reciente
      list.sort((a, b) => {
        const p = (b.priority ?? 0) - (a.priority ?? 0);
        if (p !== 0) return p;
        return (b.createdAt?.toMillis?.() ?? Infinity) - (a.createdAt?.toMillis?.() ?? Infinity);
      });
      setItems(list);
    });
  }, [partnerId]);

  async function toggleReserved(item, e) {
    if (!item.reserved) {
      burstHearts(e.clientX, e.clientY);
      toast("¡Regalo pillado! 🤫");
    } else {
      toast("Reserva soltada 👌");
    }
    await updateDoc(doc(db, "items", item.id), { reserved: !item.reserved });
  }

  const reservedCount = items?.filter((i) => i.reserved).length ?? 0;
  const visible = items?.filter((i) => filter === "all" || i.category === filter) ?? null;
  const totalPrice = visible?.reduce((sum, i) => sum + (i.price || 0), 0) ?? 0;

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

      {items?.length === 0 && (
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

      {items?.length > 0 && (
        <>
          <FilterPills value={filter} onChange={setFilter} />

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
                style={{ width: `${(reservedCount / items.length) * 100}%` }}
              />
            </div>
          </div>

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
                style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                onToggleReserved={(e) => toggleReserved(item, e)}
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
