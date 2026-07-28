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

const ITEMS = collection(db, "items");

export default function PartnerWishlist({ partnerId, partnerName }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const q = query(ITEMS, where("owner", "==", partnerId));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.toMillis?.() ?? Infinity) - (a.createdAt?.toMillis?.() ?? Infinity));
      setItems(list);
    });
  }, [partnerId]);

  async function toggleReserved(item) {
    await updateDoc(doc(db, "items", item.id), { reserved: !item.reserved });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-bold text-lg mb-4 text-primary">
        Lista de {partnerName} 🎁
      </h2>
      <div className="flex flex-col gap-3">
        {items.length === 0 && (
          <p className="text-center text-ink/50 py-8">
            {partnerName} todavía no ha añadido deseos.
          </p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-blob shadow-card p-5 animate-popIn flex justify-between items-start gap-4 transition-colors ${
              item.reserved ? "bg-success/40" : "bg-white"
            }`}
          >
            <div>
              <p className={`font-bold text-ink ${item.reserved ? "line-through opacity-60" : ""}`}>
                {item.title}
              </p>
              {item.note && <p className="text-sm text-ink/60">{item.note}</p>}
              <div className="flex gap-3 mt-1 text-sm">
                {item.price != null && (
                  <span className="text-secondary font-semibold">{item.price} €</span>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    Ver enlace
                  </a>
                )}
              </div>
            </div>
            <button
              onClick={() => toggleReserved(item)}
              className={`shrink-0 rounded-bubble px-4 py-2 font-bold text-sm shadow-soft active:translate-y-1 active:shadow-none transition-all ${
                item.reserved ? "bg-ink/10 text-ink/60" : "bg-secondary text-white"
              }`}
            >
              {item.reserved ? "Desreservar" : "Reservar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
