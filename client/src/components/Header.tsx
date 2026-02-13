import { BellIcon } from "./Icons";

export default function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(255,251,245,0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #e7e5e4",
      }}
    >
      <div
        style={{
          height: 56,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#f59e0b" }}>
            みんなの
          </span>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#292524" }}>
            ネコゴコロ
          </span>
        </div>
        <button
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#78716c",
          }}
        >
          <BellIcon size={20} />
        </button>
      </div>
    </header>
  );
}
