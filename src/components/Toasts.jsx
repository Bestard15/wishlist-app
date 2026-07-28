import { useEffect, useRef, useState } from "react";

export default function Toasts() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  useEffect(() => {
    function onToast(e) {
      const id = nextId.current++;
      setToasts((t) => [...t, { id, message: e.detail.message, leaving: false }]);
      setTimeout(() => {
        setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
      }, 2000);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 2300);
    }
    window.addEventListener("app:toast", onToast);
    return () => window.removeEventListener("app:toast", onToast);
  }, []);

  return (
    <div className="fixed top-4 inset-x-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`bg-ink text-white text-sm font-bold rounded-full px-5 py-2.5 shadow-card animate-popIn ${
            t.leaving ? "toast-leave" : ""
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
