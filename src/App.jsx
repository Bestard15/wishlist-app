import { useEffect, useRef, useState } from "react";
import { collection, doc, onSnapshot, query, setDoc, where } from "firebase/firestore";
import { db } from "./firebase";
import Onboarding from "./components/Onboarding";
import MyWishlist from "./components/MyWishlist";
import PartnerWishlist from "./components/PartnerWishlist";
import SecretIdeas from "./components/SecretIdeas";
import ProfileModal from "./components/ProfileModal";
import PinModal from "./components/PinModal";
import OccasionsModal from "./components/OccasionsModal";
import HistoryModal from "./components/HistoryModal";
import Avatar from "./components/Avatar";
import Toasts from "./components/Toasts";
import { nearestOccasion, toast } from "./ui";

const COUPLE_DOC = doc(db, "meta", "couple");
const TABS = ["mine", "partner", "ideas"];

export default function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("mine");
  const [editingProfiles, setEditingProfiles] = useState(false);
  const [creatingPin, setCreatingPin] = useState(false);
  const [partnerNews, setPartnerNews] = useState(0);
  const [occasions, setOccasions] = useState([]);
  const [showOccasions, setShowOccasions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const notifiedIds = useRef(new Set());

  // Mantiene los perfiles frescos mientras hay sesión (avatares/nombres editados en otro dispositivo)
  useEffect(() => {
    if (!session) return;
    return onSnapshot(COUPLE_DOC, (snap) => {
      if (!snap.exists()) {
        localStorage.removeItem("whoAmI");
        setSession(null);
        return;
      }
      setSession((s) => (s ? { ...s, couple: snap.data() } : s));
    });
  }, [!!session]);

  // Ocasiones compartidas (cumples, aniversario, fiestas)
  useEffect(() => {
    if (!session) return;
    return onSnapshot(collection(db, "occasions"), (snap) => {
      setOccasions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [!!session]);

  // Avisa cuando la pareja añade deseos nuevos (badge, toast y notificación del sistema)
  useEffect(() => {
    if (!session) return;
    const me = session.whoAmI;
    const other = me === "p1" ? "p2" : "p1";
    const seenKey = `lastSeenPartner_${me}`;
    const q = query(collection(db, "items"), where("owner", "==", other));
    return onSnapshot(q, (snap) => {
      if (!localStorage.getItem(seenKey)) {
        localStorage.setItem(seenKey, String(Date.now()));
        return;
      }
      const last = Number(localStorage.getItem(seenKey));
      const fresh = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((it) => (it.createdAt?.toMillis?.() ?? 0) > last);
      setPartnerNews(fresh.length);
      const unannounced = fresh.filter((it) => !notifiedIds.current.has(it.id));
      if (unannounced.length > 0) {
        unannounced.forEach((it) => notifiedIds.current.add(it.id));
        toast(`¡${session.couple[other]} ha añadido un deseo! 👀`);
      }
    });
  }, [session?.whoAmI]);

  // Al entrar en la pestaña de la pareja, marca todo como visto
  useEffect(() => {
    if (!session || tab !== "partner") return;
    localStorage.setItem(`lastSeenPartner_${session.whoAmI}`, String(Date.now()));
    setPartnerNews(0);
  }, [tab, session?.whoAmI, partnerNews]);

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
  const myPinMissing = !couple[`${whoAmI}Pin`];
  const tabIndex = TABS.indexOf(tab);
  const occasionsById = Object.fromEntries(occasions.map((o) => [o.id, o]));
  const next = occasions.length ? nearestOccasion(occasions) : null;

  return (
    <div className="min-h-dvh font-rounded text-ink pb-28 sm:pb-16">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-peach/60 blur-3xl animate-floatSlow" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-sky/60 blur-3xl animate-floatSlower" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-banana/40 blur-3xl animate-floatSlow" />
      </div>

      <Toasts />

      <header className="text-center pt-8 pb-5 px-4">
        <button
          onClick={() => setEditingProfiles(true)}
          title="Editar perfiles"
          className="inline-flex items-center gap-2.5 bg-white/70 backdrop-blur border border-white rounded-full pl-2 pr-2 py-1.5 text-sm font-bold text-ink/60 shadow-sm animate-popIn hover:scale-105 active:scale-95 hover:bg-white transition-all"
        >
          <Avatar personId="p1" name={couple.p1} avatar={couple.p1Avatar} size="sm" />
          <span className="truncate max-w-[6.5rem]">{couple.p1}</span>
          <span className="animate-beat inline-block">💕</span>
          <span className="truncate max-w-[6.5rem]">{couple.p2}</span>
          <Avatar personId="p2" name={couple.p2} avatar={couple.p2Avatar} size="sm" />
        </button>
        <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">
          Wishlist <span className="text-primary">de Pareja</span>
        </h1>
        <p className="text-ink/60 font-semibold mt-1">
          Hola, {myName} ✨{" "}
          <button
            className="text-ink/55 underline decoration-2 decoration-ink/25 hover:text-ink/80 transition-colors"
            onClick={() => {
              localStorage.removeItem("whoAmI");
              setSession(null);
            }}
          >
            no soy yo
          </button>
        </p>

        <div className="flex justify-center gap-2 flex-wrap mt-3">
          <button
            onClick={() => setShowOccasions(true)}
            className="inline-flex items-center gap-1.5 bg-white/70 hover:bg-white text-ink/70 text-xs font-extrabold rounded-full px-4 py-2 shadow-sm border border-white transition-colors"
          >
            🎂 Ocasiones
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="inline-flex items-center gap-1.5 bg-white/70 hover:bg-white text-ink/70 text-xs font-extrabold rounded-full px-4 py-2 shadow-sm border border-white transition-colors"
          >
            🏆 Historial
          </button>
          {myPinMissing && (
            <button
              onClick={() => setCreatingPin(true)}
              className="inline-flex items-center gap-1.5 bg-banana/60 hover:bg-banana/80 text-ink text-xs font-extrabold rounded-full px-4 py-2 shadow-sm transition-colors animate-popIn"
            >
              🔐 Protege tu perfil: crea tu PIN
            </button>
          )}
        </div>

        {next && (
          <p className="mt-2.5 text-xs font-extrabold text-ink/55 animate-popIn">
            {next.emoji} {next.name}{" "}
            {next.days === 0 ? "— ¡es HOY! 🎉" : `en ${next.days} ${next.days === 1 ? "día" : "días"}`}
          </p>
        )}
      </header>

      <nav className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] inset-x-4 z-40 sm:static sm:inset-x-auto sm:mx-auto sm:max-w-md sm:mb-8 sm:px-0">
        <div className="relative grid grid-cols-3 bg-white/85 backdrop-blur border border-white rounded-bubble shadow-card p-1.5 mx-auto max-w-md">
          <span
            aria-hidden
            className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(33.333%-4px)] rounded-[1.15rem] bg-primary shadow-soft transition-transform duration-[380ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{ transform: `translateX(${tabIndex * 100}%)` }}
          />
          <button
            onClick={() => setTab("mine")}
            className={`relative z-10 py-3 font-extrabold text-[13px] sm:text-sm transition-all active:scale-95 truncate px-1 ${
              tab === "mine" ? "text-white" : "text-ink/60"
            }`}
          >
            Mi lista 🎀
          </button>
          <button
            onClick={() => setTab("partner")}
            className={`relative z-10 py-3 font-extrabold text-[13px] sm:text-sm transition-all active:scale-95 truncate px-1 ${
              tab === "partner" ? "text-white" : "text-ink/60"
            }`}
          >
            La de {partnerName} 🎁
            {partnerNews > 0 && (
              <span className="absolute top-0.5 right-1 min-w-[20px] h-5 px-1 rounded-full bg-primary text-white text-[11px] font-extrabold flex items-center justify-center ring-2 ring-white animate-popIn">
                {partnerNews}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("ideas")}
            className={`relative z-10 py-3 font-extrabold text-[13px] sm:text-sm transition-all active:scale-95 truncate px-1 ${
              tab === "ideas" ? "text-white" : "text-ink/60"
            }`}
          >
            Ideas 🤫
          </button>
        </div>
      </nav>

      <main key={tab} className="px-4 animate-fadeSlide">
        {tab === "mine" && (
          <MyWishlist myId={whoAmI} occasions={occasions} occasionsById={occasionsById} />
        )}
        {tab === "partner" && (
          <PartnerWishlist
            partnerId={partnerId}
            partnerName={partnerName}
            occasions={occasions}
            occasionsById={occasionsById}
            partnerInfo={couple[`${partnerId}Info`]}
          />
        )}
        {tab === "ideas" && (
          <SecretIdeas
            myId={whoAmI}
            partnerName={partnerName}
            occasions={occasions}
            occasionsById={occasionsById}
          />
        )}
      </main>

      {editingProfiles && (
        <ProfileModal
          couple={couple}
          whoAmI={whoAmI}
          onClose={() => setEditingProfiles(false)}
        />
      )}

      {showOccasions && (
        <OccasionsModal occasions={occasions} onClose={() => setShowOccasions(false)} />
      )}

      {showHistory && <HistoryModal couple={couple} onClose={() => setShowHistory(false)} />}

      {creatingPin && (
        <PinModal
          mode="create"
          personId={whoAmI}
          personName={myName}
          onClose={() => setCreatingPin(false)}
          onSuccess={async (hash) => {
            await setDoc(COUPLE_DOC, { [`${whoAmI}Pin`]: hash }, { merge: true });
            setCreatingPin(false);
            toast("PIN creado 🔐");
          }}
        />
      )}
    </div>
  );
}
