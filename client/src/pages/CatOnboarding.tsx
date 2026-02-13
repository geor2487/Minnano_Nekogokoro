import { useState } from "react";
import { PawPrint } from "../components/Icons";

interface CatOnboardingProps {
  onComplete: (cat: {
    name: string;
    breed: string;
    age: number;
    gender: string;
    personality?: string;
  }) => Promise<void>;
}

const BREEDS = [
  "雑種", "スコティッシュフォールド", "マンチカン", "ロシアンブルー",
  "ベンガル", "ラグドール", "アメリカンショートヘア", "ブリティッシュショートヘア",
  "メインクーン", "ペルシャ", "アビシニアン", "三毛猫", "黒猫", "白猫", "茶トラ", "キジトラ", "サバトラ",
];

export default function CatOnboarding({ onComplete }: CatOnboardingProps) {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [personality, setPersonality] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !breed || !age || !gender) {
      setError("名前、猫種、年齢、性別は必須です");
      return;
    }

    setLoading(true);
    try {
      await onComplete({
        name,
        breed,
        age: parseInt(age),
        gender,
        personality: personality || undefined,
      });
    } catch {
      setError("猫の登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #e7e5e4",
    fontSize: 14,
    color: "#1c1917",
    background: "#fafaf9",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
        padding: "40px 20px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 24,
          padding: "36px 28px",
          boxShadow: "0 4px 24px rgba(180,83,9,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              border: "3px solid #fbbf24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#b45309",
            }}
          >
            <PawPrint size={32} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#292524", margin: 0 }}>
            うちの子を登録しよう!
          </h2>
          <p style={{ fontSize: 13, color: "#78716c", marginTop: 8 }}>
            猫の情報を入力すると、より正確なネコゴコロ翻訳ができるよ
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: 13,
                color: "#dc2626",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>
              猫の名前
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="もち、そら..." style={inputStyle} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>
              猫種
            </label>
            <select
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              required
              style={{
                ...inputStyle,
                appearance: "none",
                WebkitAppearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
              }}
            >
              <option value="">猫種を選択...</option>
              {BREEDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>
                年齢
              </label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required min="0" max="30" placeholder="3" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>
                性別
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {["オス", "メス"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 12,
                      border: gender === g ? "2px solid #f59e0b" : "1px solid #e7e5e4",
                      background: gender === g ? "#fffbeb" : "#fafaf9",
                      color: gender === g ? "#b45309" : "#78716c",
                      fontSize: 14,
                      fontWeight: gender === g ? 700 : 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>
              性格・特徴（任意）
            </label>
            <textarea
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="甘えん坊、ツンデレ、好奇心旺盛..."
              rows={3}
              style={{
                ...inputStyle,
                resize: "none",
                lineHeight: 1.6,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 14,
              border: "none",
              background: loading ? "#d6d3d1" : "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
              fontFamily: "inherit",
              boxShadow: loading ? "none" : "0 2px 8px rgba(245,158,11,0.3)",
            }}
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </form>
      </div>
    </div>
  );
}
