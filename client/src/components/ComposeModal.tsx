import { useState, useEffect, useRef } from "react";
import type { Cat, TranslateResult } from "../types";
import api from "../lib/api";
import { uploadImage } from "../utils/imageUpload";
import { CameraIcon, TranslateIcon, VideoIcon, PawPrint } from "./Icons";
import MoodBadge from "./MoodBadge";
import SpeechBubble from "./SpeechBubble";
import Avatar from "./Avatar";
import ImageCropper from "./ImageCropper";

const BREEDS = [
  "雑種", "スコティッシュフォールド", "マンチカン", "ロシアンブルー",
  "ベンガル", "ラグドール", "アメリカンショートヘア", "ブリティッシュショートヘア",
  "メインクーン", "ペルシャ", "アビシニアン", "三毛猫", "黒猫", "白猫", "茶トラ", "キジトラ", "サバトラ",
];

interface ComposeModalProps {
  cats: Cat[];
  onClose: () => void;
  onPost: (data: {
    content: string;
    catId: string;
    translation?: string;
    mood?: string;
    moodFace?: string;
  }) => Promise<void>;
  onRegisterCat?: (data: { name: string; breed: string; age: number; gender: string; personality?: string; photoUrl?: string }) => Promise<Cat>;
}

export default function ComposeModal({ cats, onClose, onPost, onRegisterCat }: ComposeModalProps) {
  const [content, setContent] = useState("");
  const [selectedCatId, setSelectedCatId] = useState(cats[0]?.id || "");
  const [translation, setTranslation] = useState<TranslateResult | null>(null);
  const [translating, setTranslating] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cats.length > 0 && !selectedCatId) {
      setSelectedCatId(cats[0].id);
    }
  }, [cats, selectedCatId]);

  const handleTranslate = async () => {
    if (!content.trim() || !selectedCatId) return;
    setTranslating(true);
    setError("");
    try {
      const res = await api.post("/translate", { catId: selectedCatId, text: content });
      setTranslation(res.data);
    } catch {
      setError("翻訳に失敗しました");
    } finally {
      setTranslating(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim() || !selectedCatId) return;
    setPosting(true);
    setError("");
    try {
      await onPost({
        content,
        catId: selectedCatId,
        translation: translation?.translation,
        mood: translation?.mood,
        moodFace: translation?.moodFace,
      });
      onClose();
    } catch {
      setError("投稿に失敗しました");
    } finally {
      setPosting(false);
    }
  };

  const selectedCat = cats.find((c) => c.id === selectedCatId);

  // Cat registration form when no cats exist
  if (cats.length === 0 && onRegisterCat) {
    return <CatRegistrationPrompt onClose={onClose} onRegister={onRegisterCat} />;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#fffbf5",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid #e7e5e4",
        }}
      >
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "none",
            fontSize: 14,
            color: "#78716c",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          キャンセル
        </button>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#292524" }}>新規投稿</span>
        <button
          onClick={handlePost}
          disabled={!content.trim() || !selectedCatId || posting}
          style={{
            border: "none",
            background: content.trim() && selectedCatId && !posting ? "#f59e0b" : "#e7e5e4",
            color: content.trim() && selectedCatId && !posting ? "#fff" : "#a8a29e",
            fontSize: 14,
            fontWeight: 600,
            padding: "6px 16px",
            borderRadius: 10,
            cursor: content.trim() && selectedCatId && !posting ? "pointer" : "default",
            fontFamily: "inherit",
          }}
        >
          {posting ? "投稿中..." : "投稿する"}
        </button>
      </div>

      {/* Cat selector */}
      <div style={{ padding: "12px 20px 0", display: "flex", alignItems: "center", gap: 8 }}>
        <select
          value={selectedCatId}
          onChange={(e) => {
            setSelectedCatId(e.target.value);
            setTranslation(null);
          }}
          style={{
            padding: "8px 32px 8px 12px",
            borderRadius: 10,
            border: "1px solid #e7e5e4",
            fontSize: 13,
            fontWeight: 600,
            color: "#292524",
            background: "#fafaf9",
            fontFamily: "inherit",
            outline: "none",
            appearance: "none",
            WebkitAppearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
          }}
        >
          {cats.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.breed})
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "8px 20px" }}>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "8px 12px", fontSize: 13, color: "#dc2626" }}>
            {error}
          </div>
        </div>
      )}

      {/* Text area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="うちの子が今こんなことしてる..."
        style={{
          flex: 1,
          width: "100%",
          border: "none",
          outline: "none",
          fontSize: 15,
          color: "#1c1917",
          background: "transparent",
          resize: "none",
          fontFamily: "inherit",
          lineHeight: 1.7,
          padding: "16px 20px",
          boxSizing: "border-box",
        }}
      />

      {/* Translation result */}
      {translation && selectedCat && (
        <div style={{ padding: "0 20px 12px" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Avatar initial={selectedCat.name.charAt(0)} size="sm" photoUrl={selectedCat.photoUrl} />
            <div style={{ flex: 1 }}>
              <SpeechBubble>
                <p style={{ fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>{translation.translation}</p>
              </SpeechBubble>
              <div style={{ marginTop: 6 }}>
                <MoodBadge mood={translation.mood} face={translation.moodFace} size="sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid #e7e5e4",
          display: "flex",
          gap: 8,
        }}
      >
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 10,
            border: "none",
            background: "#fef3c7",
            color: "#f59e0b",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <CameraIcon size={18} />
          写真
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 10,
            border: "none",
            background: "#fce7f3",
            color: "#ec4899",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <VideoIcon size={18} />
          動画
        </button>
        <button
          onClick={handleTranslate}
          disabled={!content.trim() || !selectedCatId || translating}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 10,
            border: "none",
            background: translating ? "#d6d3d1" : "#eff6ff",
            color: translating ? "#fff" : "#3b82f6",
            fontSize: 13,
            fontWeight: 600,
            cursor: !content.trim() || !selectedCatId || translating ? "default" : "pointer",
            fontFamily: "inherit",
          }}
        >
          <TranslateIcon size={18} />
          {translating ? "翻訳中..." : "ネコゴコロ翻訳"}
        </button>
      </div>
    </div>
  );
}

// Inline cat registration when user has no cats
function CatRegistrationPrompt({
  onClose,
  onRegister,
}: {
  onClose: () => void;
  onRegister: (data: { name: string; breed: string; age: number; gender: string; personality?: string; photoUrl?: string }) => Promise<Cat>;
}) {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [personality, setPersonality] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropFile(file);
    }
    if (e.target) e.target.value = "";
  };

  const handlePhotoCropped = (croppedFile: File) => {
    setPhotoFile(croppedFile);
    setPhotoPreview(URL.createObjectURL(croppedFile));
    setCropFile(null);
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

  const handleSubmit = async () => {
    if (!name || !breed || !age || !gender) {
      setError("名前、猫種、年齢、性別は必須です");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let photoUrl: string | undefined;
      if (photoFile) {
        photoUrl = await uploadImage(photoFile);
      }
      await onRegister({
        name,
        breed,
        age: parseInt(age),
        gender,
        personality: personality || undefined,
        photoUrl,
      });
    } catch {
      setError("猫の登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#fffbf5",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid #e7e5e4",
        }}
      >
        <button
          onClick={onClose}
          style={{ border: "none", background: "none", fontSize: 14, color: "#78716c", cursor: "pointer", fontFamily: "inherit" }}
        >
          キャンセル
        </button>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#292524" }}>猫を登録</span>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: "#78716c", marginBottom: 16 }}>
            投稿するにはまず猫を登録してね
          </p>
          <input
            type="file"
            accept="image/*"
            ref={photoInputRef}
            onChange={handlePhotoSelect}
            style={{ display: "none" }}
          />
          <div
            onClick={() => photoInputRef.current?.click()}
            style={{ cursor: "pointer", display: "inline-block" }}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt={name || "猫"}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  border: "3px solid #fbbf24",
                  objectFit: "cover",
                  display: "block",
                  margin: "0 auto",
                }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                  border: "3px solid #fbbf24",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  color: "#b45309",
                }}
              >
                <CameraIcon size={28} />
              </div>
            )}
            <p style={{ fontSize: 11, color: "#a8a29e", marginTop: 4 }}>写真を追加</p>
          </div>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>猫の名前</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="もち、そら..." style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>猫種</label>
          <select
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
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
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>年齢</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} min="0" max="30" placeholder="3" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>性別</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["オス", "メス"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 12,
                    border: gender === g ? "2px solid #f59e0b" : "1px solid #e7e5e4",
                    background: gender === g ? "#fffbeb" : "#fafaf9",
                    color: gender === g ? "#b45309" : "#78716c",
                    fontSize: 14, fontWeight: gender === g ? 700 : 500,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>性格・特徴（任意）</label>
          <textarea
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            placeholder="甘えん坊、ツンデレ、好奇心旺盛..."
            rows={3}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "14px 0", borderRadius: 14, border: "none",
            background: loading ? "#d6d3d1" : "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#fff", fontSize: 16, fontWeight: 700,
            cursor: loading ? "default" : "pointer", fontFamily: "inherit",
            boxShadow: loading ? "none" : "0 2px 8px rgba(245,158,11,0.3)",
          }}
        >
          {loading ? "登録中..." : "登録して投稿画面へ"}
        </button>
      </div>
    </div>
    {cropFile && (
      <ImageCropper
        file={cropFile}
        onCrop={handlePhotoCropped}
        onCancel={() => setCropFile(null)}
      />
    )}
    </>
  );
}
