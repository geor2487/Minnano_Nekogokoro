import { useEffect, useState } from "react";
import api from "../lib/api";
import MoodBadge from "../components/MoodBadge";
import type { Cat, TranslateResult, Mood } from "../types";

interface ComposeProps {
  onClose: () => void;
  onPost: () => void;
}

export default function Compose({ onClose, onPost }: ComposeProps) {
  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [content, setContent] = useState("");
  const [translation, setTranslation] = useState<TranslateResult | null>(null);
  const [translating, setTranslating] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Cat[]>("/cats")
      .then((res) => {
        setCats(res.data);
        if (res.data.length > 0) {
          setSelectedCatId(res.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const canTranslate = content.trim().length > 0 && selectedCatId !== "";
  const canPost = content.trim().length > 0;

  const handleTranslate = async () => {
    if (!canTranslate) return;
    setTranslating(true);
    setError("");
    try {
      const res = await api.post<TranslateResult>("/translate", {
        text: content,
        catId: selectedCatId,
      });
      setTranslation(res.data);
    } catch {
      setError("翻訳に失敗しました。もう一度お試しください");
    } finally {
      setTranslating(false);
    }
  };

  const handlePost = async () => {
    if (!canPost || posting) return;
    setPosting(true);
    setError("");
    try {
      await api.post("/posts", {
        content,
        catId: selectedCatId,
        translation: translation?.translation ?? null,
        mood: translation?.mood ?? null,
        moodFace: translation?.moodFace ?? null,
      });
      onPost();
    } catch {
      setError("投稿に失敗しました。もう一度お試しください");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#fffbf5]">
      <div className="max-w-lg mx-auto flex flex-col w-full h-full">
        {/* ヘッダー */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-stone-200">
          <button
            onClick={onClose}
            className="border-none bg-transparent text-sm text-stone-500 cursor-pointer"
          >
            キャンセル
          </button>
          <span className="font-bold text-base text-stone-800">新規投稿</span>
          <button
            onClick={handlePost}
            disabled={!canPost || posting}
            className={`border-none text-sm font-semibold px-4 py-1.5 rounded-[10px] ${
              canPost && !posting
                ? "bg-amber-500 text-white cursor-pointer"
                : "bg-stone-200 text-stone-400"
            }`}
          >
            {posting ? "投稿中..." : "投稿"}
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto">
          {/* 猫選択 */}
          <div className="px-5 pt-4 pb-2">
            <label className="mb-1 block text-sm font-medium text-stone-600">
              猫を選択
            </label>
            <select
              value={selectedCatId}
              onChange={(e) => {
                setSelectedCatId(e.target.value);
                setTranslation(null);
              }}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">選択してください</option>
              {cats.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}（{cat.breed}）
                </option>
              ))}
            </select>
          </div>

          {/* テキストエリア */}
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setTranslation(null);
            }}
            placeholder="うちの子が今こんなことしてる..."
            rows={8}
            className="flex-1 w-full border-none outline-none text-[15px] text-stone-800 bg-transparent resize-none leading-relaxed p-5"
          />

          {/* エラー表示 */}
          {error && (
            <div className="mx-5 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 翻訳結果 */}
          {translation && (
            <div className="mx-5 mt-2 rounded-lg bg-amber-50 p-4">
              <div className="mb-2">
                <MoodBadge mood={translation.mood as Mood} />
              </div>
              <p className="text-sm text-stone-700">{translation.translation}</p>
            </div>
          )}
        </div>

        {/* ボトムツールバー */}
        <div className="px-5 py-3 border-t border-stone-200 flex gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border-none bg-amber-100 text-amber-500 text-[13px] font-semibold cursor-pointer">
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            写真
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border-none bg-pink-100 text-pink-500 text-[13px] font-semibold cursor-pointer">
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            動画
          </button>
          <button
            onClick={handleTranslate}
            disabled={!canTranslate || translating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border-none bg-blue-100 text-blue-500 text-[13px] font-semibold cursor-pointer disabled:opacity-40"
          >
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M2 5h7M5 2v3M3 10a5.002 5.002 0 006.001 0"/>
              <path d="M14 8l3 8 3-8"/>
              <path d="M15.5 14h5"/>
              <path d="M8 14l-2 4"/>
            </svg>
            {translating ? "翻訳中..." : "翻訳"}
          </button>
        </div>
      </div>
    </div>
  );
}
