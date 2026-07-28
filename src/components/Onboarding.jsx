import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const COUPLE_DOC = doc(db, "meta", "couple");

export default function Onboarding({ onReady }) {
  const [couple, setCouple] = useState(undefined);
  const [nameA, setNameA] = useState("");
  const [nameB, setNameB] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return onSnapshot(COUPLE_DOC, (snap) => {
      setCouple(snap.exists() ? snap.data() : null);
    });
  }, []);

  useEffect(() => {
    if (!couple) return;
    const whoAmI = localStorage.getItem("whoAmI");
    if (whoAmI === "p1" || whoAmI === "p2") {
      onReady(couple, whoAmI);
    }
  }, [couple, onReady]);

  if (couple === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-appbg font-rounded text-ink">
        Cargando...
      </div>
    );
  }

  if (couple === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-appbg font-rounded text-ink px-4">
        <form
          className="w-full max-w-sm bg-white rounded-blob shadow-card p-8 animate-popIn"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!nameA.trim() || !nameB.trim()) return;
            setSaving(true);
            await setDoc(COUPLE_DOC, { p1: nameA.trim(), p2: nameB.trim() });
            setSaving(false);
          }}
        >
          <h1 className="text-2xl font-bold mb-1 text-primary">¡Hola pareja! 💕</h1>
          <p className="text-sm text-ink/60 mb-6">
            Es la primera vez que se abre esta wishlist. Escribid vuestros nombres.
          </p>
          <label className="block text-sm font-semibold mb-1">Persona 1</label>
          <input
            className="w-full mb-4 rounded-bubble border-2 border-sky/60 px-4 py-2 focus:outline-none focus:border-secondary"
            value={nameA}
            onChange={(e) => setNameA(e.target.value)}
            placeholder="Tu nombre"
          />
          <label className="block text-sm font-semibold mb-1">Persona 2</label>
          <input
            className="w-full mb-6 rounded-bubble border-2 border-sky/60 px-4 py-2 focus:outline-none focus:border-secondary"
            value={nameB}
            onChange={(e) => setNameB(e.target.value)}
            placeholder="Nombre de tu pareja"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-white font-bold rounded-bubble py-3 shadow-soft active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
          >
            {saving ? "Creando..." : "Crear nuestra wishlist"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-appbg font-rounded text-ink px-4">
      <div className="w-full max-w-sm bg-white rounded-blob shadow-card p-8 animate-popIn text-center">
        <h1 className="text-2xl font-bold mb-1 text-primary">¿Quién eres? 👀</h1>
        <p className="text-sm text-ink/60 mb-6">Elige tu nombre para este dispositivo.</p>
        <div className="flex flex-col gap-3">
          {["p1", "p2"].map((id) => (
            <button
              key={id}
              onClick={() => {
                localStorage.setItem("whoAmI", id);
                onReady(couple, id);
              }}
              className="bg-secondary/20 hover:bg-secondary/30 text-ink font-bold rounded-bubble py-3 transition-colors"
            >
              {couple[id]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
