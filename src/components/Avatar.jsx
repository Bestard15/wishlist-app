const FALLBACK_BG = { p1: "bg-primary", p2: "bg-secondary" };

export default function Avatar({ personId, name, avatar, size = "md", className = "" }) {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-11 h-11 text-lg",
    lg: "w-20 h-20 text-4xl"
  };
  const base = `${sizes[size]} rounded-full shrink-0 flex items-center justify-center overflow-hidden ${className}`;

  if (avatar?.startsWith("data:")) {
    return <img src={avatar} alt={name} className={`${base} object-cover`} />;
  }
  if (avatar) {
    return <span className={`${base} bg-white/80 border-2 border-white shadow-sm`}>{avatar}</span>;
  }
  return (
    <span className={`${base} ${FALLBACK_BG[personId] || "bg-ink/40"} text-white font-extrabold`}>
      {(name || "?").trim().charAt(0).toUpperCase()}
    </span>
  );
}
