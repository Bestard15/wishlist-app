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

const ITEMS = collection(db, "items");

export default function MyWishlist({ myId }) {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", url: "", note: "", price: "" });

  useEffect(() => {
    const q = query(ITEMS, where("owner", "==", myId));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Más recientes primero; los pendientes de serverTimestamp (null) arriba
      list.sort((a, b) => (b.createdAt?.toMillis?.() ?? Infinity) - (a.createdAt?.toMillis?.() ?? Infinity));
      setItems(list);
    });
  }, [myId]);

  function resetForm() {
    setForm({ title: "", url: "", note: "", price: "" });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      url: form.url.trim(),
      note: form.note.trim(),
      price: form.price === "" ? null : Number(form.price)
    };
    if (editingId) {
      await updateDoc(doc(db, "items", editingId), payload);
    } else {
      await addDoc(ITEMS, {
        ...payload,
        owner: myId,
        reserved: false,
        createdAt: serverTimestamp()
      });
    }
    resetForm();
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      url: item.url || "",
      note: item.note || "",
      price: item.price ?? ""
    });
  }

  async function removeItem(id) {
    await deleteDoc(doc(db, "items", id));
    if (editingId === id) resetForm();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-blob shadow-card p-6 mb-6 animate-popIn"
      >
        <h2 className="font-bold text-lg mb-4 text-primary">
          {editingId ? "Editar deseo ✏️" : "Añadir un deseo ✨"}
        </h2>
        <input
          className="w-full mb-3 rounded-bubble border-2 border-sky/60 px-4 py-2 focus:outline-none focus:border-secondary"
          placeholder="¿Qué deseas?"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="w-full mb-3 rounded-bubble border-2 border-sky/60 px-4 py-2 focus:outline-none focus:border-secondary"
          placeholder="Enlace (opcional)"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />
        <div className="flex gap-3 mb-4">
          <input
            className="flex-1 rounded-bubble border-2 border-sky/60 px-4 py-2 focus:outline-none focus:border-secondary"
            placeholder="Nota (opcional)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
          <input
            type="number"
            className="w-28 rounded-bubble border-2 border-sky/60 px-4 py-2 focus:outline-none focus:border-secondary"
            placeholder="Precio"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-primary text-white font-bold rounded-bubble py-3 shadow-soft active:translate-y-1 active:shadow-none transition-all"
          >
            {editingId ? "Guardar cambios" : "Añadir a mi lista"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-5 rounded-bubble bg-appbg font-bold text-ink/60"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {items.length === 0 && (
          <p className="text-center text-ink/50 py-8">
            Tu lista está vacía. ¡Añade tu primer deseo! 🎁
          </p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-blob shadow-card p-5 animate-popIn flex justify-between items-start gap-4"
          >
            <div>
              <p className="font-bold text-ink">{item.title}</p>
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
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => startEdit(item)}
                className="w-9 h-9 rounded-full bg-banana/40 hover:bg-banana/60 transition-colors"
                aria-label="Editar"
              >
                ✏️
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="w-9 h-9 rounded-full bg-peach/40 hover:bg-peach/60 transition-colors"
                aria-label="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
