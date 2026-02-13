import type { CSSProperties } from "react";
import { HomeIcon, SearchIcon, UserIcon, PlusIcon } from "./Icons";

interface BottomNavProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  onCompose: () => void;
}

export default function BottomNav({ currentTab, onChangeTab, onCompose }: BottomNavProps) {
  const items = [
    { id: "home", Icon: HomeIcon },
    { id: "search", Icon: SearchIcon },
    { id: "profile", Icon: UserIcon },
  ] as const;

  const navStyle: CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 480,
    background: "rgba(255,251,245,0.85)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderTop: "1px solid rgba(231,229,228,0.6)",
    zIndex: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    height: 56,
    padding: "0 16px",
  };

  return (
    <nav style={navStyle}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChangeTab(item.id)}
          style={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: currentTab === item.id ? "#f59e0b" : "#a8a29e",
            transition: "color 0.15s",
            borderRadius: 12,
          }}
        >
          <item.Icon size={currentTab === item.id ? 25 : 23} />
        </button>
      ))}
      <button
        onClick={onCompose}
        style={{
          width: 42,
          height: 42,
          borderRadius: 13,
          background: "linear-gradient(135deg,#f59e0b,#d97706)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#fff",
          boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
        }}
      >
        <PlusIcon size={21} />
      </button>
    </nav>
  );
}
