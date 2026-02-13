import { useState } from "react";
import { PawPrint, TranslateIcon } from "./Icons";

interface OnboardingGuideProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: "paw",
    title: "みんなのネコゴコロへようこそ",
    desc: "猫の飼い主さんのためのSNSだよ。\nうちの子の日常をシェアしたり、\n他の猫ちゃんの様子を見たりできるよ。",
  },
  {
    icon: "translate",
    title: "ネコゴコロ翻訳",
    desc: "AIが猫の気持ちを翻訳してくれる機能があるよ。\n投稿するときに「ネコゴコロ翻訳」ボタンを押すと、\n猫の気分や気持ちを教えてくれるよ。",
  },
  {
    icon: "start",
    title: "さっそく始めよう",
    desc: "タイムラインはログインなしでも見られるよ。\n投稿するにはログインして猫を登録してね。\nまずはみんなの投稿を覗いてみよう!",
  },
];

export default function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [step, setStep] = useState(0);

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          width: "100%",
          maxWidth: 380,
          padding: "36px 28px 28px",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
            border: "3px solid #fbbf24",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            color: "#b45309",
          }}
        >
          {current.icon === "paw" && <PawPrint size={36} />}
          {current.icon === "translate" && <TranslateIcon size={36} />}
          {current.icon === "start" && (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h2 style={{ fontSize: 19, fontWeight: 700, color: "#292524", margin: "0 0 12px" }}>
          {current.title}
        </h2>

        {/* Description */}
        <p style={{ fontSize: 14, color: "#78716c", lineHeight: 1.7, whiteSpace: "pre-line", marginBottom: 28 }}>
          {current.desc}
        </p>

        {/* Step dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i === step ? "#f59e0b" : "#e7e5e4",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: 14,
                border: "1px solid #e7e5e4",
                background: "#fff",
                color: "#78716c",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              戻る
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) {
                onComplete();
              } else {
                setStep(step + 1);
              }
            }}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
            }}
          >
            {isLast ? "始める" : "次へ"}
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button
            onClick={onComplete}
            style={{
              background: "none",
              border: "none",
              fontSize: 13,
              color: "#a8a29e",
              cursor: "pointer",
              fontFamily: "inherit",
              marginTop: 12,
              padding: "4px 8px",
            }}
          >
            スキップ
          </button>
        )}
      </div>
    </div>
  );
}
