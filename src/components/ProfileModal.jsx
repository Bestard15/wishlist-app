import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "../ui";
import Avatar from "./Avatar";

const COUPLE_DOC = doc(db, "meta", "couple");
const AVATAR_EMOJIS = ["🦊", "🐻", "🐰", "🐱", "🐶", "🦁", "🐼", "🐨", "🦄", "🐸", "🐯", "🐹"];

async function fileToAvatar(file) {
  if (!file.type.startsWith("image/")) throw new Error("formato");
  if (file.size > 10 * 1024 * 1024) throw new Error("tamaño");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const crop = Math.min(img.width, img.height);
    ctx.drawImage(img, (img.width - crop) / 2, (img.height - crop) / 2, crop, crop, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function ProfileEditor({ personId, profile, onChange }) {
  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await fileToAvatar(file);
      onChange({ ...profile, avatar: dataUrl });
    } catch {
      toast("No pude usar esa imagen 😅");
    }
  }

  return (
    <div className="rounded-bubble bg-appbg/70 p-4">
      <div className="flex items-center gap-4 mb-3">
        <Avatar personId={personId} name={profile.name} avatar={profile.avatar} size="lg" />
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-bold uppercase tracking-wide text-ink/40 mb-1.5">
            Nombre o apodo
          </label>
          <input
            className="w-full rounded-bubble bg-white border-2 border-transparent px-4 py-2.5 font-semibold focus:outline-none focus:border-secondary transition-colors"
            value={profile.name}
            onChange={(e) => onChange({ ...profile, name: e.target.value })}
            placeholder="Nombre"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {AVATAR_EMOJIS.map((em) => (
          <button
            key={em}
            type="button"
            onClick={() => onChange({ ...profile, avatar: em })}
            className={`w-9 h-9 rounded-full text-base transition-all ${
              profile.avatar === em
                ? "bg-secondary/25 ring-2 ring-secondary scale-110"
                : "bg-white hover:bg-sky/40"
            }`}
          >
            {em}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <label className="flex-1 text-center cursor-pointer bg-white hover:bg-sky/30 text-ink/70 text-sm font-bold rounded-bubble py-2.5 transition-colors">
          📷 Subir foto
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        {profile.avatar && (
          <button
            type="button"
            onClick={() => onChange({ ...profile, avatar: "" })}
            className="px-4 bg-white hover:bg-peach/40 text-ink/50 text-sm font-bold rounded-bubble transition-colors"
          >
            Quitar
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProfileModal({ couple, onClose }) {
  const [profiles, setProfiles] = useState({
    p1: { name: couple.p1, avatar: couple.p1Avatar || "" },
    p2: { name: couple.p2, avatar: couple.p2Avatar || "" }
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSave(e) {
    e.preventDefault();
    if (!profiles.p1.name.trim() || !profiles.p2.name.trim() || saving) return;
    setSaving(true);
    await setDoc(
      COUPLE_DOC,
      {
        p1: profiles.p1.name.trim(),
        p2: profiles.p2.name.trim(),
        p1Avatar: profiles.p1.avatar,
        p2Avatar: profiles.p2.avatar
      },
      { merge: true }
    );
    toast("Perfiles guardados 💫");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSave}
        className="w-full sm:max-w-md bg-white rounded-t-blob sm:rounded-blob shadow-float p-6 sm:p-8 animate-slideUp sm:animate-popIn max-h-[92dvh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-xl text-ink">Vuestros perfiles 💕</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-full bg-appbg text-ink/50 font-bold hover:bg-ink/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <ProfileEditor
            personId="p1"
            profile={profiles.p1}
            onChange={(p) => setProfiles({ ...profiles, p1: p })}
          />
          <ProfileEditor
            personId="p2"
            profile={profiles.p2}
            onChange={(p) => setProfiles({ ...profiles, p2: p })}
          />
        </div>

        <button
          type="submit"
          disabled={saving || !profiles.p1.name.trim() || !profiles.p2.name.trim()}
          className="w-full bg-primary text-white font-extrabold text-lg rounded-bubble py-3.5 shadow-soft active:translate-y-1 active:shadow-none transition-all disabled:opacity-40"
        >
          {saving ? "Guardando..." : "Guardar perfiles"}
        </button>
      </form>
    </div>
  );
}
