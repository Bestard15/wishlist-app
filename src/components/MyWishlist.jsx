import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "../firebase";
import { fmtPrice, normalizeUrl, toast } from "../ui";
import FilterPills from "./FilterPills";
import WishCard from "./WishCard";
import WishModal from "./WishModal";

const ITEMS = collection(db, "items");

function SkeletonCard() {
  return (
    <div className="rounded-blob shadow-card p-5 bg-white">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl shimmer" />
        <div className="flex-1 pt-1">
          <div className="h-4 w-2/3 rounded-full shimmer mb-2.5" />
          <div className="h-3 w-1/3 rounded-full shimmer" />
        </div>
      </div>
    </div>
  );
}

export default function MyWishlist({ myId }) {
  const [items, setItems] = useState(null);
  const [modal, setModal] = useState(null); // null | { item? }
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const q = query(ITEMS, where("owner", "==", myId));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Más recientes primero; los pendientes de serverTimestamp (null) arriba
      list.sort((a, b) => (b.createdAt?.toMillis?.() ?? Infinity) - (a.createdAt?.toMillis?.() ?? Infinity));
      setItems(list);
    });
  }, [myId]);

  async function saveWish(form) {
    const payload = {
      title: form.title.trim(),
      url: normalizeUrl(form.url),
      note: form.note.trim(),
      price: form.price === "" ? null : Number(form.price),
      emoji: form.emoji,
      priority: form.priority,
      category: form.category
    };
    if (modal?.item) {
      await updateDoc(doc(db, "items", modal.item.id), payload);
      toast("Deseo actualizado 💫");
    } else {
      await addDoc(ITEMS, {
        ...payload,
        owner: myId,
        reserved: false,
        createdAt: serverTimestamp()
      });
      toast("¡Deseo apuntado! ✨");
    }
    setModal(null);
  }

  async function removeItem(id) {
    await deleteDoc(doc(db, "items", id));
    toast("Deseo eliminado 🗑️");
  }

  const visible = items?.filter((i) => filter === "all" || i.category === filter) ?? null;
  const totalPrice = visible?.reduce((sum, i) => sum + (i.price || 0), 0) ?? 0;

  return (
    <div className="max-w-2xl mx-auto">
      {items === null && (
        <div className="flex flex-col gap-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {items?.length > 0 && (
        <>
          <FilterPills value={filter} onChange={setFilter} />
          <p className="text-center text-xs font-bold text-ink/40 mb-4">
            {visible.length} {visible.length === 1 ? "deseo" : "deseos"}
            {totalPrice > 0 && <> · ~{fmtPrice(totalPrice)} €</>}
          </p>
        </>
      )}

      {items?.length === 0 && (
        <div className="text-center py-14 animate-popIn">
          <div className="text-6xl mb-4 animate-wiggle inline-block">🎈</div>
          <p className="font-extrabold text-xl text-ink mb-1">Tu lista está vacía</p>
          <p className="text-ink/50 mb-6 max-w-xs mx-auto">
            Pide sin miedo: apunta esa cosita que llevas tiempo mirando 👀
          </p>
          <button
            onClick={() => setModal({})}
            className="bg-primary text-white font-extrabold rounded-bubble px-6 py-3 shadow-soft active:translate-y-1 active:shadow-none transition-all"
          >
            ＋ Mi primer deseo
          </button>
        </div>
      )}

      {items?.length > 0 && visible.length === 0 && (
        <p className="text-center text-ink/40 font-semibold py-10 animate-popIn">
          Nada por aquí con este filtro 🤷
        </p>
      )}

      {visible?.length > 0 && (
        <div className="flex flex-col gap-3">
          {visible.map((item) => (
            <WishCard
              key={item.id}
              item={item}
              mode="mine"
              onEdit={() => setModal({ item })}
              onDelete={() => removeItem(item.id)}
            />
          ))}
        </div>
      )}

      {items?.length > 0 && (
        <button
          onClick={() => setModal({})}
          aria-label="Añadir deseo"
          className="fixed bottom-24 right-5 sm:bottom-10 sm:right-10 z-40 w-14 h-14 rounded-full bg-primary text-white text-3xl font-bold shadow-float active:scale-90 transition-transform flex items-center justify-center leading-none"
        >
          +
        </button>
      )}

      {modal && (
        <WishModal initial={modal.item} onSave={saveWish} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
