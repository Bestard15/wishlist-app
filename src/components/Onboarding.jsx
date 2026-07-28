import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import Avatar from "./Avatar";

const COUPLE_DOC = doc(db, "meta", "couple");

function Backdrop({ children }) {
  return (
    <div className="min-h-dvh flex items-center justify-center font-rounded text-ink px-4 py-10">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-peach/60 blur-3xl animate-floatSlow" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-sky/60 blur-3xl animate-floatSlower" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-banana/40 blur-3xl animate-floatSlow" />
      </div>
      {children}
    </div>
  );
}

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
      <Backdrop>
        <div className="text-center animate-popIn">
          <div className="text-6xl animate-beat inline-block">💗</div>
          <p className="mt-3 font-bold text-ink/50">Preparando la magia...</p>
        </div>
      </Backdrop>
    );
  }

  if (couple === null) {
    return (
      <Backdrop>
        <form
          className="w-full max-w-sm bg-white/90 backdrop-blur rounded-blob shadow-float p-8 animate-popIn"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!nameA.trim() || !nameB.trim()) return;
            setSaving(true);
            await setDoc(COUPLE_DOC, { p1: nameA.trim(), p2: nameB.trim() });
            setSaving(false);
          }}
        >
          <div className="text-5xl mb-3 animate-wiggle inline-block">💌</div>
          <h1 className="text-2xl font-extrabold mb-1 text-ink">
            ¡Hola, <span className="text-primary">pareja</span>!
          </h1>
          <p className="text-sm text-ink/55 mb-6">
            Primera vez por aquí. Decidme vuestros nombres y a pedir deseos.
          </p>
          <label className="block text-xs font-bold uppercase tracking-wide text-ink/40 mb-1.5">
            Persona 1
          </label>
          <input
            className="w-full mb-4 rounded-bubble bg-appbg border-2 border-transparent px-4 py-3 font-semibold focus:outline-none focus:border-primary focus:bg-white transition-colors"
            value={nameA}
            onChange={(e) => setNameA(e.target.value)}
            placeholder="Tu nombre"
          />
          <label className="block text-xs font-bold uppercase tracking-wide text-ink/40 mb-1.5">
            Persona 2
          </label>
          <input
            className="w-full mb-6 rounded-bubble bg-appbg border-2 border-transparent px-4 py-3 font-semibold focus:outline-none focus:border-secondary focus:bg-white transition-colors"
            value={nameB}
            onChange={(e) => setNameB(e.target.value)}
            placeholder="Nombre de tu pareja"
          />
          <button
            type="submit"
            disabled={saving || !nameA.trim() || !nameB.trim()}
            className="w-full bg-primary text-white font-extrabold text-lg rounded-bubble py-3.5 shadow-soft active:translate-y-1 active:shadow-none transition-all disabled:opacity-40"
          >
            {saving ? "Creando..." : "Crear nuestra wishlist 💘"}
          </button>
        </form>
      </Backdrop>
    );
  }

  return (
    <Backdrop>
      <div className="w-full max-w-sm bg-white/90 backdrop-blur rounded-blob shadow-float p-8 animate-popIn text-center">
        <div className="text-5xl mb-3">👀</div>
        <h1 className="text-2xl font-extrabold mb-1 text-ink">¿Quién eres?</h1>
        <p className="text-sm text-ink/55 mb-6">
          Elige tu nombre — este dispositivo te recordará.
        </p>
        <div className="flex flex-col gap-3">
          {["p1", "p2"].map((id, i) => (
            <button
              key={id}
              onClick={() => {
                localStorage.setItem("whoAmI", id);
                onReady(couple, id);
              }}
              className={`group flex items-center gap-3 rounded-bubble p-3 pr-5 transition-all hover:scale-[1.02] active:scale-95 ${
                i === 0 ? "bg-peach/50 hover:bg-peach/70" : "bg-sky/50 hover:bg-sky/70"
              }`}
            >
              <Avatar personId={id} name={couple[id]} avatar={couple[`${id}Avatar`]} size="md" />
              <span className="font-extrabold text-ink flex-1 text-left truncate">
                {couple[id]}
              </span>
              <span className="text-ink/40 font-bold text-sm group-hover:translate-x-1 transition-transform">
                soy yo →
              </span>
            </button>
          ))}
        </div>
      </div>
    </Backdrop>
  );
}
