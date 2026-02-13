interface SpeechBubbleProps {
  children: React.ReactNode;
}

export default function SpeechBubble({ children }: SpeechBubbleProps) {
  return (
    <div
      style={{
        position: "relative",
        background: "#fffbeb",
        borderRadius: "16px 16px 16px 4px",
        padding: "10px 14px",
        border: "1px solid #fde68a",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -7,
          top: 12,
          width: 0,
          height: 0,
          borderTop: "5px solid transparent",
          borderBottom: "5px solid transparent",
          borderRight: "7px solid #fde68a",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -5,
          top: 13,
          width: 0,
          height: 0,
          borderTop: "4px solid transparent",
          borderBottom: "4px solid transparent",
          borderRight: "6px solid #fffbeb",
        }}
      />
      {children}
    </div>
  );
}
