import type { CSSProperties } from "react";
import ConsultMoodBadge from "./ConsultMoodBadge";
import SpeechBubble from "./SpeechBubble";
import type { ConsultResult } from "../types";

interface ConsultResultDisplayProps {
  result: ConsultResult;
}

const sectionStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 14,
  padding: "14px 16px",
  border: "1px solid #e7e5e4",
};

const iconWrapStyle: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

// SVG: 虫眼鏡+猫 → 行動解説用
function ExplainIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
      <path d="M9 9.5c.5-1 2.5-1 3 0" strokeWidth="1.5" />
    </svg>
  );
}

// SVG: ハート+手 → アドバイス用
function AdviceIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2">
      <path d="M12 21C12 21 4 15 4 9.5C4 6.5 6.5 4 9 4C10.5 4 11.7 4.8 12 5.5C12.3 4.8 13.5 4 15 4C17.5 4 20 6.5 20 9.5C20 15 12 21 12 21Z" />
    </svg>
  );
}

export default function ConsultResultDisplay({ result }: ConsultResultDisplayProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Mood Badge (centered, lg) */}
      <div style={{ textAlign: "center" }}>
        <ConsultMoodBadge mood={result.mood} size="lg" />
      </div>

      {/* Feeling - SpeechBubble */}
      <SpeechBubble>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#78350f", fontWeight: 500 }}>
          {result.feeling}
        </p>
      </SpeechBubble>

      {/* Explanation Card */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ ...iconWrapStyle, background: "#eff6ff" }}>
            <ExplainIcon />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>
            行動の解説
          </span>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "#44403c" }}>
          {result.explanation}
        </p>
      </div>

      {/* Advice Card */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ ...iconWrapStyle, background: "#ecfdf5" }}>
            <AdviceIcon />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#047857" }}>
            飼い主へのアドバイス
          </span>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "#44403c" }}>
          {result.advice}
        </p>
      </div>
    </div>
  );
}
