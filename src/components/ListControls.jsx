const CATEGORIES = [
  { key: "all", label: "Todo" },
  { key: "need", label: "🧦 Necesidades" },
  { key: "whim", label: "🦄 Caprichos" }
];

const PRICES = [
  { key: "any", label: "€ Todos" },
  { key: "low", label: "< 25 €" },
  { key: "mid", label: "25–100 €" },
  { key: "high", label: "> 100 €" }
];

const SORTS = [
  { key: "recent", label: "🕐 Recientes" },
  { key: "hearts", label: "❤️ Ilusión" },
  { key: "priceAsc", label: "€ ↑ baratos" },
  { key: "priceDesc", label: "€ ↓ caros" }
];

export function matchesPrice(item, range) {
  if (range === "any") return true;
  if (item.price == null) return false;
  if (range === "low") return item.price < 25;
  if (range === "mid") return item.price >= 25 && item.price <= 100;
  return item.price > 100;
}

export function sortItems(list, sort) {
  const time = (i) => i.createdAt?.toMillis?.() ?? Infinity;
  const sorted = [...list];
  if (sort === "hearts") {
    sorted.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || time(b) - time(a));
  } else if (sort === "priceAsc") {
    sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity) || time(b) - time(a));
  } else if (sort === "priceDesc") {
    sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity) || time(b) - time(a));
  } else {
    sorted.sort((a, b) => time(b) - time(a));
  }
  return sorted;
}

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] min-h-[40px] font-extrabold transition-all active:scale-95 ${
        active ? "bg-ink text-white shadow-soft" : "bg-white/80 text-ink/60 hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

// Tiras deslizables en móvil (evita que los filtros ocupen 3 filas), centradas en pantallas grandes
const ROW = "flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center";

export default function ListControls({ filter, onFilter, price, onPrice, sort, onSort }) {
  const sortIndex = SORTS.findIndex((s) => s.key === sort);
  const current = SORTS[sortIndex] || SORTS[0];

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className={ROW}>
        {CATEGORIES.map((opt) => (
          <Pill key={opt.key} active={filter === opt.key} onClick={() => onFilter(opt.key)}>
            {opt.label}
          </Pill>
        ))}
      </div>
      <div className={ROW}>
        {PRICES.map((opt) => (
          <Pill key={opt.key} active={price === opt.key} onClick={() => onPrice(opt.key)}>
            {opt.label}
          </Pill>
        ))}
        <button
          onClick={() => onSort(SORTS[(sortIndex + 1) % SORTS.length].key)}
          title="Cambiar orden"
          className="shrink-0 rounded-full px-3.5 py-2 text-[13px] min-h-[40px] font-extrabold bg-secondary/15 text-ink ring-2 ring-secondary/40 hover:ring-secondary transition-all active:scale-95"
        >
          {current.label}
        </button>
      </div>
    </div>
  );
}
