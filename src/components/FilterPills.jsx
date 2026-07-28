const OPTIONS = [
  { key: "all", label: "Todo" },
  { key: "need", label: "🧦 Necesidades" },
  { key: "whim", label: "🦄 Caprichos" }
];

export default function FilterPills({ value, onChange }) {
  return (
    <div className="flex justify-center gap-2 mb-4 flex-wrap">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`rounded-full px-5 py-2.5 text-sm min-h-[44px] font-extrabold transition-all active:scale-95 ${
            value === opt.key
              ? "bg-ink text-white shadow-soft scale-105"
              : "bg-white/80 text-ink/60 hover:bg-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
