import { useState, useEffect, useRef } from "react";
import { usePosts } from "../hooks/usePosts";
import api from "../lib/api";
import PostCard from "./PostCard";
import { SearchIcon, ClockIcon, FlameIcon, PawPrint } from "./Icons";

interface SearchTabProps {
  onComment: (postId: string) => void;
  requireAuth?: (action: () => void) => void;
  onFollowCat?: (catId: string) => void;
  currentUserId?: string;
}

export default function SearchTab({ onComment, requireAuth, currentUserId }: SearchTabProps) {
  const { posts, loading, searchPosts, toggleLike, toggleFollowCat, deletePost } = usePosts();

  const handleLike = (postId: string) => {
    if (requireAuth) {
      requireAuth(() => toggleLike(postId));
    } else {
      toggleLike(postId);
    }
  };

  const handleFollowCat = (catId: string) => {
    if (requireAuth) {
      requireAuth(() => toggleFollowCat(catId));
    } else {
      toggleFollowCat(catId);
    }
  };

  const [query, setQuery] = useState("");
  const [searchTab, setSearchTab] = useState("latest");
  const [breeds, setBreeds] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    searchPosts("", searchTab);
  }, [searchTab, searchPosts]);

  useEffect(() => {
    if (searchTab === "breeds") {
      api.get("/search", { params: { q: query, type: "breeds" } }).then((res) => {
        setBreeds(res.data);
      });
    }
  }, [searchTab, query]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchTab !== "breeds") {
        searchPosts(value, searchTab);
      }
    }, 300);
  };

  const handleBreedClick = (breed: string) => {
    setQuery(breed);
    setSearchTab("latest");
    searchPosts(breed, "latest");
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Search bar */}
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #e7e5e4",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <SearchIcon size={18} style={{ color: "#a8a29e" }} />
        <input
          type="text"
          placeholder="猫種、ユーザー名で検索..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            fontSize: 14,
            color: "#1c1917",
            background: "transparent",
            flex: 1,
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[
          { id: "latest", label: "最新", icon: <ClockIcon size={14} style={{ marginRight: 3 }} /> },
          { id: "popular", label: "人気", icon: <FlameIcon size={14} style={{ marginRight: 3 }} /> },
          { id: "breeds", label: "猫種", icon: <PawPrint size={13} style={{ marginRight: 3 }} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSearchTab(t.id)}
            style={{
              padding: "7px 14px",
              borderRadius: 20,
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              background: searchTab === t.id ? "#f59e0b" : "#f5f5f4",
              color: searchTab === t.id ? "#fff" : "#78716c",
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {searchTab !== "breeds" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 12, color: "#a8a29e", marginBottom: 4 }}>
            {searchTab === "latest" ? "みんなの最新投稿" : "いいねが多い投稿"}
          </p>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: "3px solid #fde68a",
                  borderTopColor: "#f59e0b",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : posts.length === 0 ? (
            <p style={{ textAlign: "center", padding: "40px 0", color: "#a8a29e", fontSize: 14 }}>
              投稿が見つかりませんでした
            </p>
          ) : (
            posts.map((p) => (
              <PostCard key={p.id} post={p} onLike={handleLike} onComment={onComment} onFollowCat={handleFollowCat} onDelete={deletePost} currentUserId={currentUserId} />
            ))
          )}
        </div>
      )}

      {searchTab === "breeds" && (
        <div>
          <p style={{ fontSize: 12, color: "#a8a29e", marginBottom: 10 }}>猫種から探す</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {breeds.length > 0
              ? breeds.map((b) => (
                  <button
                    key={b}
                    onClick={() => handleBreedClick(b)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border: "1px solid #e7e5e4",
                      background: "#fff",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#57534e",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {b}
                  </button>
                ))
              : ["雑種", "スコティッシュフォールド", "マンチカン", "ロシアンブルー", "ベンガル", "ラグドール"].map((b) => (
                  <button
                    key={b}
                    onClick={() => handleBreedClick(b)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border: "1px solid #e7e5e4",
                      background: "#fff",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#57534e",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {b}
                  </button>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}
