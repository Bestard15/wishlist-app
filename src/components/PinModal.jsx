import { useEffect, useRef, useState } from "react";
import { hashPin } from "../ui";

// mode "create": pide PIN nuevo y confirmación, llama onSuccess(hash)
// mode "verify": compara contra expectedHash, llama onSuccess()
export default function PinModal({ mode, personId, personName, expectedHash, onSuccess, onClose }) {
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  function fail(message) {
    setError(message);
    setPin("");
    setShaking(true);
    setTimeout(() => setShaking(false), 450);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (checking) return;
    if (!/^\d{4,6}$/.test(pin)) {
      fail("El PIN debe tener de 4 a 6 números");
      return;
    }
    setChecking(true);
    try {
      if (mode === "verify") {
        const hash = await hashPin(personId, pin);
        if (hash === expectedHash) {
          onSuccess();
        } else {
          fail("PIN incorrecto 🙈");
        }
        return;
      }
      // create
      if (step === 1) {
        setFirstPin(pin);
        setPin("");
        setStep(2);
        setError("");
        return;
      }
      if (pin !== firstPin) {
        setStep(1);
        setFirstPin("");
        fail("No coinciden, empieza de nuevo");
        return;
      }
      onSuccess(await hashPin(personId, pin));
    } finally {
      setChecking(false);
    }
  }

  const title =
    mode === "verify"
      ? `PIN de ${personName} 🔐`
      : step === 1
        ? `Crea tu PIN, ${personName} 🔐`
        : "Repítelo para confirmar ✌️";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className={`w-full sm:max-w-sm bg-white rounded-t-blob sm:rounded-blob shadow-float p-6 sm:p-8 animate-slideUp sm:animate-popIn text-center ${
          shaking ? "animate-shake" : ""
        }`}
      >
        <div aria-hidden className="sm:hidden mx-auto -mt-1 mb-4 h-1.5 w-12 rounded-full bg-ink/15" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-lg text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-11 h-11 rounded-full bg-appbg text-ink/50 font-bold hover:bg-ink/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {mode === "create" && step === 1 && (
          <p className="text-sm text-ink/55 mb-4 text-left">
            Protege tu perfil: se pedirá cuando alguien intente entrar como tú en un
            dispositivo. De 4 a 6 números.
          </p>
        )}

        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
          className="w-40 mx-auto block text-center text-3xl tracking-[0.5em] font-extrabold rounded-bubble bg-appbg border-2 border-transparent px-4 py-3 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
          placeholder="····"
        />

        {error && <p className="text-primary text-sm font-bold mt-3">{error}</p>}

        <button
          type="submit"
          disabled={checking || pin.length < 4}
          className="mt-5 w-full bg-primary text-white font-extrabold rounded-bubble py-3 shadow-soft active:translate-y-1 active:shadow-none transition-all disabled:opacity-40"
        >
          {mode === "verify" ? "Entrar" : step === 1 ? "Continuar" : "Guardar PIN"}
        </button>
      </form>
    </div>
  );
}
