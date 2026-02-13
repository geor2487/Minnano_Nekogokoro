import { useEffect, useState } from "react";
import api from "../lib/api";
import type { User, Cat } from "../types";

interface ProfileProps {
  user: User | null;
  onLogout: () => void;
}

export default function Profile({ user, onLogout }: ProfileProps) {
  const [cats, setCats] = useState<Cat[]>([]);

  useEffect(() => {
    if (!user) return;
    api
      .get<Cat[]>("/cats")
      .then((res) => setCats(res.data))
      .catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">ログインしてください</p>
      </div>
    );
  }

  const initial = user.name.charAt(0).toUpperCase();
  const postCount = user._count?.posts ?? 0;
  const followerCount = (user._count as Record<string, number> | undefined)?.followers ?? 0;
  const followingCount = user._count?.following ?? 0;

  return (
    <div className="min-h-screen bg-[#fffbf5]">
      {/* プロフィールヘッダー */}
      <div className="bg-gradient-to-br from-amber-100 via-amber-200 to-orange-200 px-4 pt-8 pb-5 text-center">
        <div className="w-20 h-20 rounded-full bg-white border-[3px] border-amber-400 flex items-center justify-center mx-auto mb-3 text-[28px] font-bold text-amber-700">
          {initial}
        </div>
        <h1 className="text-xl font-bold text-stone-800">{user.name}</h1>
        {user.bio && (
          <p className="text-[13px] text-stone-500 mt-1">{user.bio}</p>
        )}
        <div className="flex justify-center gap-8 mt-4">
          <div>
            <p className="text-lg font-bold text-stone-800">{postCount}</p>
            <p className="text-[11px] text-stone-500">投稿</p>
          </div>
          <div>
            <p className="text-lg font-bold text-stone-800">{followerCount}</p>
            <p className="text-[11px] text-stone-500">フォロワー</p>
          </div>
          <div>
            <p className="text-lg font-bold text-stone-800">{followingCount}</p>
            <p className="text-[11px] text-stone-500">フォロー</p>
          </div>
        </div>
      </div>

      {/* うちの猫たち */}
      <div className="px-4 pt-5">
        <h2 className="flex items-center gap-1.5 text-[15px] font-bold text-stone-800 mb-3">
          <svg className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
            <ellipse cx="12" cy="16" rx="5" ry="4"/>
            <circle cx="7" cy="9" r="2.2"/>
            <circle cx="12" cy="7" r="2.2"/>
            <circle cx="17" cy="9" r="2.2"/>
            <circle cx="5" cy="13" r="1.8"/>
            <circle cx="19" cy="13" r="1.8"/>
          </svg>
          うちの猫たち
        </h2>
        {cats.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 px-4 py-3.5">
            <p className="text-center text-sm text-stone-400">
              猫が登録されていません
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {cats.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-stone-200 px-4 py-3.5 flex items-center gap-3.5"
              >
                <div className="w-[52px] h-[52px] rounded-full border-2 border-amber-400 flex items-center justify-center text-xl font-bold text-amber-700 shrink-0 bg-gradient-to-br from-amber-100 to-amber-200">
                  {cat.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-stone-800">
                    {cat.name}
                  </p>
                  <p className="text-xs text-stone-400">{cat.breed}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 設定 */}
      <div className="px-4 pt-5 pb-5">
        <h2 className="text-[13px] font-bold text-stone-500 mb-2.5">設定</h2>
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {["プロフィール編集", "通知設定", "アカウント設定"].map(
            (label, index) => (
              <div
                key={label}
                className={`px-4 py-[13px] text-sm cursor-pointer text-stone-600${
                  index < 2 ? " border-b border-stone-100" : ""
                }`}
              >
                {label}
              </div>
            )
          )}
          <div
            onClick={onLogout}
            className="px-4 py-[13px] text-sm cursor-pointer font-medium text-red-500 border-t border-stone-100"
          >
            ログアウト
          </div>
        </div>
      </div>
    </div>
  );
}
