import { CONSULT_MOOD_COLORS, CONSULT_MOOD_FACES } from "../types";
import type { ConsultMood } from "../types";

interface ConsultMoodBadgeProps {
  mood: string;
  size?: "sm" | "md" | "lg";
}

export default function ConsultMoodBadge({ mood, size = "md" }: ConsultMoodBadgeProps) {
  const m = mood as ConsultMood;
  const c = CONSULT_MOOD_COLORS[m] || CONSULT_MOOD_COLORS["ご機嫌"];
  const f = CONSULT_MOOD_FACES[m] || "^_^";
  const isLg = size === "lg";
  const isSm = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isLg ? 8 : isSm ? 3 : 5,
        padding: isLg ? "6px 16px" : isSm ? "1px 7px" : "2px 9px",
        borderRadius: 99,
        border: `1px solid ${c.bd}`,
        background: c.bg,
        color: c.fg,
        fontSize: isLg ? 15 : isSm ? 10 : 11,
        fontWeight: 600,
      }}
    >
      <span style={{ fontFamily: "monospace", fontSize: isLg ? 14 : isSm ? 9 : 10 }}>
        {f}
      </span>
      {mood}
    </span>
  );
}
