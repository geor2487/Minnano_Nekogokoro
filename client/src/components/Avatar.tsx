import type { CSSProperties } from "react";

const COLOR_MAP = {
  amber: { bg: "#fef3c7", fg: "#b45309", bd: "#fde68a" },
  pink: { bg: "#fce7f3", fg: "#be185d", bd: "#fbcfe8" },
  blue: { bg: "#dbeafe", fg: "#1d4ed8", bd: "#bfdbfe" },
  violet: { bg: "#ede9fe", fg: "#6d28d9", bd: "#ddd6fe" },
} as const;

const SIZE_MAP = {
  sm: { s: 32, f: 12 },
  md: { s: 40, f: 14 },
  lg: { s: 48, f: 16 },
  xl: { s: 72, f: 28 },
} as const;

interface AvatarProps {
  initial: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: keyof typeof COLOR_MAP;
  photoUrl?: string | null;
  style?: CSSProperties;
}

export default function Avatar({
  initial,
  size = "md",
  color = "amber",
  photoUrl,
  style = {},
}: AvatarProps) {
  const c = COLOR_MAP[color];
  const sz = SIZE_MAP[size];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={initial}
        style={{
          width: sz.s,
          height: sz.s,
          borderRadius: "50%",
          border: "2px solid " + c.bd,
          objectFit: "cover",
          flexShrink: 0,
          ...style,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: sz.s,
        height: sz.s,
        borderRadius: "50%",
        background: c.bg,
        color: c.fg,
        border: "2px solid " + c.bd,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: sz.f,
        flexShrink: 0,
        ...style,
      }}
    >
      {initial}
    </div>
  );
}
