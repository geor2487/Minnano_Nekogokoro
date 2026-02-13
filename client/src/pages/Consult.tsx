import { useState, useRef, useEffect, useCallback } from "react";
import type { CSSProperties } from "react";
import type { Cat, InputType, FrameCount, ConsultResult } from "../types";
import { FRAME_OPTIONS, CONSULT_MOOD_FACES } from "../types";
import type { ConsultMood } from "../types";
import { useConsult } from "../hooks/useConsult";
import { resizeImage, extractBase64 } from "../utils/image";
import { extractVideoFrames } from "../utils/video";
import { uploadImage, uploadVideo } from "../utils/imageUpload";
import ConsultResultDisplay from "../components/ConsultResultDisplay";
import { XIcon, CameraIcon, VideoIcon, TextIcon, ImageIcon } from "../components/Icons";
import Avatar from "../components/Avatar";

interface ConsultProps {
  cats: Cat[];
  onPost: (data: {
    content: string;
    catId: string;
    imageUrl?: string;
    videoUrl?: string;
    translation?: string;
    mood?: string;
    moodFace?: string;
  }) => Promise<void>;
  onGoHome: () => void;
}

const LOADING_MESSAGES = [
  "猫語に翻訳中...",
  "しっぽの動きを解析中...",
  "ヒゲのピクピクを読み取り中...",
  "にゃんこの気持ちを探り中...",
  "猫パンチの意味を考え中...",
];

export default function Consult({ cats, onPost, onGoHome }: ConsultProps) {
  const { consult, saveResult, fetchVideoCount, consulting, saving, videoCount } = useConsult();

  const [phase, setPhase] = useState<"input" | "result">("input");
  const [selectedCatId, setSelectedCatId] = useState(cats[0]?.id || "");
  const [inputType, setInputType] = useState<InputType>("text");
  const [inputText, setInputText] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState<FrameCount>(5);
  const [result, setResult] = useState<ConsultResult | null>(null);
  const [error, setError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [saved, setSaved] = useState(false);
  const [postingResult, setPostingResult] = useState(false);

  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cats.length > 0 && !selectedCatId) {
      setSelectedCatId(cats[0].id);
    }
  }, [cats, selectedCatId]);

  useEffect(() => {
    fetchVideoCount();
  }, [fetchVideoCount]);

  // Loading message rotation
  useEffect(() => {
    if (!consulting) return;
    let idx = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    const timer = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[idx]);
    }, 2500);
    return () => clearInterval(timer);
  }, [consulting]);

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }, []);

  const handleVideoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  }, []);

  const clearPhoto = useCallback(() => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (photoRef.current) photoRef.current.value = "";
  }, [photoPreview]);

  const clearVideo = useCallback(() => {
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    if (videoRef.current) videoRef.current.value = "";
  }, [videoPreview]);

  const handleSubmit = useCallback(async () => {
    setError("");
    if (!selectedCatId) {
      setError("猫を選択してください");
      return;
    }

    try {
      let imageBase64: string | undefined;
      let videoFrames: string[] | undefined;

      if (inputType === "photo" && photoFile) {
        const dataUrl = await resizeImage(photoFile, 1568);
        imageBase64 = extractBase64(dataUrl);
      }

      if (inputType === "video" && videoFile) {
        const frames = await extractVideoFrames(videoFile, frameCount, 768);
        videoFrames = frames.map(extractBase64);
      }

      const res = await consult({
        catId: selectedCatId,
        inputType,
        inputText: inputText || undefined,
        imageBase64,
        videoFrames,
      });

      setResult(res);
      setPhase("result");
      setSaved(false);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : err instanceof Error
            ? err.message
            : "エラーが発生しました";
      setError(msg || "エラーが発生しました");
    }
  }, [selectedCatId, inputType, inputText, photoFile, videoFile, frameCount, consult]);

  const handleSave = useCallback(async () => {
    if (!result) return;
    try {
      await saveResult({
        catId: selectedCatId,
        inputType,
        inputText: inputText || undefined,
        frameCount: inputType === "video" ? frameCount : undefined,
        feeling: result.feeling,
        explanation: result.explanation,
        advice: result.advice,
        mood: result.mood,
      });
      setSaved(true);
    } catch {
      setError("保存に失敗しました");
    }
  }, [result, selectedCatId, inputType, inputText, frameCount, saveResult]);

  const handleReset = useCallback(() => {
    setPhase("input");
    setResult(null);
    setError("");
    setSaved(false);
    setPosted(false);
  }, []);

  const handlePostResult = useCallback(async () => {
    if (!result || !selectedCatId) return;
    setPostingResult(true);
    try {
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;
      if (inputType === "photo" && photoFile) {
        imageUrl = await uploadImage(photoFile);
      }
      if (inputType === "video" && videoFile) {
        videoUrl = await uploadVideo(videoFile);
      }
      const moodFace = CONSULT_MOOD_FACES[result.mood as ConsultMood] || undefined;
      await onPost({
        content: inputText || result.feeling,
        catId: selectedCatId,
        imageUrl,
        videoUrl,
        translation: result.feeling,
        mood: result.mood,
        moodFace,
      });
      onGoHome();
    } catch {
      setError("投稿に失敗しました");
    } finally {
      setPostingResult(false);
    }
  }, [result, selectedCatId, inputType, inputText, photoFile, videoFile, onPost, onGoHome]);

  const canSubmit = (() => {
    if (!selectedCatId) return false;
    if (inputType === "text" && !inputText.trim()) return false;
    if (inputType === "photo" && !photoFile) return false;
    if (inputType === "video" && !videoFile) return false;
    if (inputType === "video" && videoCount >= 3) return false;
    return true;
  })();

  const selectedCat = cats.find((c) => c.id === selectedCatId);

  // ── 結果画面 ──
  if (phase === "result" && result) {
    return (
      <div style={{ padding: "16px 16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          {selectedCat && (
            <Avatar initial={selectedCat.name[0]} photoUrl={selectedCat.photoUrl} size="md" />
          )}
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1c1917" }}>
            {selectedCat?.name || ""}のキモチ
          </span>
        </div>

        {/* Media preview */}
        {inputType === "photo" && photoPreview && (
          <div style={{ marginBottom: 14, borderRadius: 12, overflow: "hidden" }}>
            <img src={photoPreview} alt="" style={{ width: "100%", display: "block" }} />
          </div>
        )}
        {inputType === "video" && videoPreview && (
          <div style={{ marginBottom: 14, borderRadius: 12, overflow: "hidden" }}>
            <video src={videoPreview} controls style={{ width: "100%", display: "block" }} />
          </div>
        )}

        <ConsultResultDisplay result={result} />

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {!saved ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: saving ? "wait" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "保存中..." : "保存する"}
              </button>
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  border: "1px solid #e7e5e4",
                  background: "#fff",
                  color: "#57534e",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                キャンセル
              </button>
            </>
          ) : (
            <>
              <div
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  color: "#047857",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                保存しました
              </div>
              <button
                onClick={handlePostResult}
                disabled={postingResult}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: postingResult ? "wait" : "pointer",
                  opacity: postingResult ? 0.7 : 1,
                }}
              >
                {postingResult ? "投稿中..." : "投稿する"}
              </button>
              <button
                onClick={onGoHome}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  border: "1px solid #e7e5e4",
                  background: "#fff",
                  color: "#57534e",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ホーム
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── ローディング ──
  if (consulting) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: "4px solid #fde68a",
            borderTopColor: "#f59e0b",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ fontSize: 14, color: "#78350f", fontWeight: 500 }}>{loadingMsg}</p>
        <style>{"@keyframes spin { to { transform: rotate(360deg) } }"}</style>
      </div>
    );
  }

  // ── 入力画面 ──
  const tabBtn = (type: InputType, label: string, Icon: React.ComponentType<{ size?: number }>) => {
    const active = inputType === type;
    return (
      <button
        key={type}
        onClick={() => setInputType(type)}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          height: 38,
          borderRadius: 10,
          border: "none",
          background: active ? "#fffbeb" : "transparent",
          color: active ? "#b45309" : "#a8a29e",
          fontWeight: active ? 700 : 500,
          fontSize: 13,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        <Icon size={16} />
        {label}
      </button>
    );
  };

  const dropZoneStyle: CSSProperties = {
    border: "2px dashed #d6d3d1",
    borderRadius: 14,
    padding: "28px 16px",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.15s",
    background: "#fafaf9",
  };

  return (
    <div style={{ padding: "16px 16px 24px" }}>
      {/* 猫セレクタ */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#78716c", marginBottom: 8 }}>
          相談する猫を選択
        </p>
        {cats.length === 0 ? (
          <p style={{ fontSize: 13, color: "#a8a29e" }}>
            まずはプロフィールから猫を登録してください
          </p>
        ) : (
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
            {cats.map((cat) => {
              const sel = cat.id === selectedCatId;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    minWidth: 64,
                    padding: 4,
                    opacity: sel ? 1 : 0.55,
                    transition: "opacity 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      border: sel ? "3px solid #f59e0b" : "3px solid transparent",
                      overflow: "hidden",
                      transition: "border-color 0.15s",
                    }}
                  >
                    <Avatar initial={cat.name[0]} photoUrl={cat.photoUrl} size="lg" />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: sel ? 700 : 500,
                      color: sel ? "#1c1917" : "#78716c",
                      whiteSpace: "nowrap",
                      maxWidth: 64,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 入力方法タブ */}
      <div
        style={{
          display: "flex",
          gap: 4,
          background: "#f5f5f4",
          borderRadius: 12,
          padding: 3,
          marginBottom: 16,
        }}
      >
        {tabBtn("text", "テキスト", TextIcon)}
        {tabBtn("photo", "写真", ImageIcon)}
        {tabBtn("video", "動画", VideoIcon)}
      </div>

      {/* テキスト入力 */}
      {inputType === "text" && (
        <div style={{ marginBottom: 16 }}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="猫の行動を教えてください（例: ずっと窓の外を見ている）"
            rows={4}
            style={{
              width: "100%",
              borderRadius: 12,
              border: "1px solid #e7e5e4",
              padding: "12px 14px",
              fontSize: 14,
              resize: "none",
              fontFamily: "inherit",
              lineHeight: 1.6,
              background: "#fff",
            }}
          />
        </div>
      )}

      {/* 写真入力 */}
      {inputType === "photo" && (
        <div style={{ marginBottom: 16 }}>
          {!photoPreview ? (
            <div style={dropZoneStyle} onClick={() => photoRef.current?.click()}>
              <CameraIcon size={32} style={{ color: "#d6d3d1", margin: "0 auto 8px" }} />
              <p style={{ fontSize: 13, color: "#a8a29e" }}>タップして写真を選択</p>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <img
                src={photoPreview}
                alt=""
                style={{ width: "100%", borderRadius: 14, display: "block" }}
              />
              <button
                onClick={clearPhoto}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.5)",
                  border: "none",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <XIcon size={14} />
              </button>
            </div>
          )}
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: "none" }}
          />
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="補足コメント（任意）"
            rows={2}
            style={{
              width: "100%",
              borderRadius: 12,
              border: "1px solid #e7e5e4",
              padding: "10px 14px",
              fontSize: 13,
              resize: "none",
              fontFamily: "inherit",
              lineHeight: 1.5,
              marginTop: 10,
              background: "#fff",
            }}
          />
        </div>
      )}

      {/* 動画入力 */}
      {inputType === "video" && (
        <div style={{ marginBottom: 16 }}>
          {videoCount >= 3 && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 12,
                fontSize: 12,
                color: "#b91c1c",
              }}
            >
              本日の動画相談回数の上限（3回）に達しました
            </div>
          )}
          {!videoPreview ? (
            <div
              style={{
                ...dropZoneStyle,
                opacity: videoCount >= 3 ? 0.5 : 1,
                pointerEvents: videoCount >= 3 ? "none" : "auto",
              }}
              onClick={() => videoRef.current?.click()}
            >
              <VideoIcon size={32} />
              <p style={{ fontSize: 13, color: "#a8a29e", marginTop: 8 }}>
                タップして動画を選択（30秒以内）
              </p>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <video
                src={videoPreview}
                controls
                style={{ width: "100%", borderRadius: 14, display: "block" }}
              />
              <button
                onClick={clearVideo}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.5)",
                  border: "none",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <XIcon size={14} />
              </button>
            </div>
          )}
          <input
            ref={videoRef}
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            style={{ display: "none" }}
          />

          {/* フレーム数選択 */}
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#78716c", marginBottom: 6 }}>
              分析の細かさ
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              {FRAME_OPTIONS.map((opt) => {
                const sel = frameCount === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFrameCount(opt.value)}
                    style={{
                      flex: 1,
                      height: 34,
                      borderRadius: 8,
                      border: sel ? "1.5px solid #f59e0b" : "1px solid #e7e5e4",
                      background: sel ? "#fffbeb" : "#fff",
                      color: sel ? "#b45309" : "#78716c",
                      fontSize: 11,
                      fontWeight: sel ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              color: "#a8a29e",
              textAlign: "right",
            }}
          >
            本日の残り回数: {Math.max(0, 3 - videoCount)}回
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="補足コメント（任意）"
            rows={2}
            style={{
              width: "100%",
              borderRadius: 12,
              border: "1px solid #e7e5e4",
              padding: "10px 14px",
              fontSize: 13,
              resize: "none",
              fontFamily: "inherit",
              lineHeight: 1.5,
              marginTop: 10,
              background: "#fff",
            }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 12,
            fontSize: 12,
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          width: "100%",
          height: 48,
          borderRadius: 14,
          border: "none",
          background: canSubmit
            ? "linear-gradient(135deg,#f59e0b,#d97706)"
            : "#e7e5e4",
          color: canSubmit ? "#fff" : "#a8a29e",
          fontSize: 15,
          fontWeight: 700,
          cursor: canSubmit ? "pointer" : "not-allowed",
          boxShadow: canSubmit ? "0 2px 8px rgba(245,158,11,0.3)" : "none",
          transition: "all 0.2s",
        }}
      >
        キモチを聞いてみる
      </button>
    </div>
  );
}
