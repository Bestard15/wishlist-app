import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
import { normalizeUrl, toast } from "../ui";
import { SkeletonCard } from "./MyWishlist";
import WishCard from "./WishCard";
import WishModal from "./WishModal";

const IDEAS = collection(db, "ideas");

export default function SecretIdeas({ myId, partnerName }) {
  const [ideas, setIdeas] = useState(null);
  const [modal, setModal] = useState(null); // null | { item? }

  useEffect(() => {
    const q = query(IDEAS, where("owner", "==", myId));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Pendientes primero, luego más recientes
      list.sort((a, b) => {
        if (!!a.done !== !!b.done) return a.done ? 1 : -1;
        return (b.createdAt?.toMillis?.() ?? Infinity) - (a.createdAt?.toMillis?.() ?? Infinity);
      });
      setIdeas(list);
    });
  }, [myId]);

  async function saveIdea(form) {
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
      await updateDoc(doc(db, "ideas", modal.item.id), payload);
      toast("Idea actualizada 💫");
    } else {
      await addDoc(IDEAS, {
        ...payload,
        owner: myId,
        done: false,
        createdAt: serverTimestamp()
      });
      toast("Idea guardada 🤫");
    }
    setModal(null);
  }

  async function removeIdea(id) {
    await deleteDoc(doc(db, "ideas", id));
    toast("Idea eliminada 🗑️");
  }

  async function toggleDone(idea) {
    await updateDoc(doc(db, "ideas", idea.id), { done: !idea.done });
    toast(idea.done ? "Recuperada 💡" : "¡Regalada! 🥳");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-ink/90 text-white rounded-bubble px-5 py-3 mb-4 text-center text-sm font-bold animate-popIn">
        🤫 Solo tú ves esta lista — {partnerName} ni se entera
      </div>

      {ideas === null && (
        <div className="flex flex-col gap-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {ideas?.length === 0 && (
        <div className="text-center py-14 animate-popIn">
          <div className="text-6xl mb-4 animate-wiggle inline-block">💡</div>
          <p className="font-extrabold text-xl text-ink mb-1">
            Tus ideas para {partnerName}
          </p>
          <p className="text-ink/60 mb-6 max-w-xs mx-auto">
            ¿Se te ha ocurrido el regalo perfecto que no está en su lista? Apúntalo
            aquí antes de que se te olvide.
          </p>
          <button
            onClick={() => setModal({})}
            className="bg-primary text-white font-extrabold rounded-bubble px-6 py-3 shadow-soft active:translate-y-1 active:shadow-none transition-all"
          >
            ＋ Mi primera idea
          </button>
        </div>
      )}

      {ideas?.length > 0 && (
        <div className="flex flex-col gap-3">
          {ideas.map((idea, i) => (
            <WishCard
              key={idea.id}
              item={idea}
              mode="idea"
              style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
              onEdit={() => setModal({ item: idea })}
              onDelete={() => removeIdea(idea.id)}
              onToggleDone={() => toggleDone(idea)}
            />
          ))}
        </div>
      )}

      {ideas?.length > 0 &&
        createPortal(
          <button
            onClick={() => setModal({})}
            aria-label="Añadir idea"
            className="fixed bottom-24 right-5 sm:bottom-10 sm:right-10 z-40 w-14 h-14 rounded-full bg-primary text-white text-3xl font-bold shadow-[0_16px_40px_rgba(255,107,107,0.4)] hover:scale-110 active:scale-90 transition-transform flex items-center justify-center leading-none animate-popIn"
          >
            +
          </button>,
          document.body
        )}

      {modal && (
        <WishModal
          kind="idea"
          initial={modal.item}
          onSave={saveIdea}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
