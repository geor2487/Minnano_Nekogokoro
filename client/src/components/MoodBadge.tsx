const MOOD_C: Record<string, { bg: string; fg: string; bd: string }> = {
  集中: { bg: "#eff6ff", fg: "#1d4ed8", bd: "#bfdbfe" },
  甘え: { bg: "#fdf2f8", fg: "#be185d", bd: "#fbcfe8" },
  無関心: { bg: "#f5f5f4", fg: "#57534e", bd: "#d6d3d1" },
  ごきげん: { bg: "#fffbeb", fg: "#b45309", bd: "#fde68a" },
  不安: { bg: "#f5f3ff", fg: "#6d28d9", bd: "#ddd6fe" },
};

const MOOD_FACES: Record<string, string> = {
  集中: ">w<",
  甘え: "^w^",
  無関心: "-_-",
  ごきげん: "^_^",
  不安: "O_O",
};

interface MoodBadgeProps {
  mood: string;
  face?: string;
  size?: "sm" | "md";
}

export default function MoodBadge({ mood, face, size = "md" }: MoodBadgeProps) {
  const c = MOOD_C[mood] || MOOD_C["ごきげん"];
  const f = face || MOOD_FACES[mood] || "^_^";
  const isSm = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSm ? 3 : 5,
        padding: isSm ? "1px 7px" : "2px 9px",
        borderRadius: 99,
        border: "1px solid " + c.bd,
        background: c.bg,
        color: c.fg,
        fontSize: isSm ? 10 : 11,
        fontWeight: 600,
      }}
    >
      <span style={{ fontFamily: "monospace", fontSize: isSm ? 9 : 10 }}>{f}</span>
      {mood}
    </span>
  );
}
