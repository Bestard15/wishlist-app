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
import { burstHearts, toast } from "../ui";
import WishCard from "./WishCard";

const ITEMS = collection(db, "items");

export default function PartnerWishlist({ partnerId, partnerName }) {
  const [items, setItems] = useState(null);

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

  return (
    <div className="max-w-2xl mx-auto">
      {items === null && (
        <div className="rounded-blob shadow-card p-5 bg-white">
          <div className="h-4 w-1/2 rounded-full shimmer" />
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
          <div className="bg-white/80 backdrop-blur rounded-bubble shadow-card px-5 py-4 mb-4 animate-popIn">
            <div className="flex items-center justify-between text-sm font-bold text-ink/70 mb-2">
              <span>
                {items.length} {items.length === 1 ? "deseo" : "deseos"} 🎀
              </span>
              <span>
                {reservedCount} {reservedCount === 1 ? "pillado" : "pillados"} 🤫
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-appbg overflow-hidden">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-500"
                style={{ width: `${(reservedCount / items.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <WishCard
                key={item.id}
                item={item}
                mode="partner"
                onToggleReserved={(e) => toggleReserved(item, e)}
              />
            ))}
          </div>

          <p className="text-center text-xs text-ink/35 mt-6 px-6">
            Tranqui: {partnerName} no ve qué está reservado — la sorpresa está a salvo 🤐
          </p>
        </>
      )}
    </div>
  );
}
