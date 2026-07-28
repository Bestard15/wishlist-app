import { useState } from "react";
import Onboarding from "./components/Onboarding";
import MyWishlist from "./components/MyWishlist";
import PartnerWishlist from "./components/PartnerWishlist";
import Toasts from "./components/Toasts";

export default function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("mine");

  if (!session) {
    return (
      <Onboarding
        onReady={(couple, whoAmI) => {
          setTab("mine");
          setSession({ couple, whoAmI });
        }}
      />
    );
  }

  const { couple, whoAmI } = session;
  const partnerId = whoAmI === "p1" ? "p2" : "p1";
  const myName = couple[whoAmI];
  const partnerName = couple[partnerId];

  return (
    <div className="min-h-dvh font-rounded text-ink pb-28 sm:pb-16">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-peach/60 blur-3xl animate-floatSlow" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-sky/60 blur-3xl animate-floatSlower" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-banana/40 blur-3xl animate-floatSlow" />
      </div>

      <Toasts />

      <header className="text-center pt-8 pb-5 px-4">
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-white rounded-full px-4 py-1.5 text-sm font-bold text-ink/60 shadow-sm animate-popIn">
          <span className="truncate max-w-[7rem]">{couple.p1}</span>
          <span className="animate-beat inline-block">💕</span>
          <span className="truncate max-w-[7rem]">{couple.p2}</span>
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">
          Wishlist <span className="text-primary">de Pareja</span>
        </h1>
        <p className="text-ink/45 font-semibold mt-1">
          Hola, {myName} ✨{" "}
          <button
            className="text-ink/35 underline decoration-2 decoration-ink/15 hover:text-ink/60 transition-colors"
            onClick={() => {
              localStorage.removeItem("whoAmI");
              setSession(null);
            }}
          >
            no soy yo
          </button>
        </p>
      </header>

      <nav className="fixed bottom-4 inset-x-4 z-40 sm:static sm:inset-x-auto sm:mx-auto sm:max-w-md sm:mb-8 sm:px-0">
        <div className="relative grid grid-cols-2 bg-white/85 backdrop-blur border border-white rounded-bubble shadow-card p-1.5 mx-auto max-w-md">
          <span
            aria-hidden
            className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-[1.15rem] bg-primary shadow-soft transition-transform duration-300 ease-out ${
              tab === "partner" ? "translate-x-full" : ""
            }`}
          />
          <button
            onClick={() => setTab("mine")}
            className={`relative z-10 py-2.5 font-extrabold text-sm transition-colors ${
              tab === "mine" ? "text-white" : "text-ink/50"
            }`}
          >
            Mi lista 🎀
          </button>
          <button
            onClick={() => setTab("partner")}
            className={`relative z-10 py-2.5 font-extrabold text-sm transition-colors truncate px-2 ${
              tab === "partner" ? "text-white" : "text-ink/50"
            }`}
          >
            La de {partnerName} 🎁
          </button>
        </div>
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
