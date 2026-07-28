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
          className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all ${
            value === opt.key
              ? "bg-ink text-white shadow-soft scale-105"
              : "bg-white/70 text-ink/50 hover:bg-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
