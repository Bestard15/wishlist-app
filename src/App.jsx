import { useState } from "react";
import Onboarding from "./components/Onboarding";
import MyWishlist from "./components/MyWishlist";
import PartnerWishlist from "./components/PartnerWishlist";

export default function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("mine");

  if (!session) {
    return <Onboarding onReady={(couple, whoAmI) => setSession({ couple, whoAmI })} />;
  }

  const { couple, whoAmI } = session;
  const partnerId = whoAmI === "p1" ? "p2" : "p1";
  const myName = couple[whoAmI];
  const partnerName = couple[partnerId];

  return (
    <div className="min-h-screen bg-appbg font-rounded text-ink pb-16">
      <header className="text-center pt-10 pb-6 px-4">
        <h1 className="text-3xl font-extrabold text-primary">Wishlist de Pareja 💕</h1>
        <p className="text-ink/60 mt-1">
          Hola, {myName} — vosotros dos: {couple.p1} &amp; {couple.p2}
        </p>
        <button
          className="mt-2 text-xs text-ink/40 underline"
          onClick={() => {
            localStorage.removeItem("whoAmI");
            setSession(null);
          }}
        >
          Cambiar de persona
        </button>
      </header>

      <nav className="flex justify-center gap-3 mb-8 px-4">
        <button
          onClick={() => setTab("mine")}
          className={`rounded-bubble px-6 py-2 font-bold transition-colors ${
            tab === "mine" ? "bg-primary text-white shadow-soft" : "bg-white text-ink/60"
          }`}
        >
          Mi lista
        </button>
        <button
          onClick={() => setTab("partner")}
          className={`rounded-bubble px-6 py-2 font-bold transition-colors ${
            tab === "partner" ? "bg-primary text-white shadow-soft" : "bg-white text-ink/60"
          }`}
        >
          Lista de {partnerName}
        </button>
      </nav>

      <main className="px-4">
        {tab === "mine" ? (
          <MyWishlist myId={whoAmI} />
        ) : (
          <PartnerWishlist partnerId={partnerId} partnerName={partnerName} />
        )}
      </main>
    </div>
  );
}
