import { useEffect, useState } from "react";
import { usePosts } from "../hooks/usePosts";
import PostCard from "./PostCard";
import { PawPrint } from "./Icons";

interface HomeTabProps {
  onComment: (postId: string) => void;
  requireAuth?: (action: () => void) => void;
  onFollowCat?: (catId: string) => void;
  currentUserId?: string;
}

export default function HomeTab({ onComment, requireAuth, currentUserId }: HomeTabProps) {
  const { posts, loading, fetchPosts, toggleLike, toggleFollowCat, deletePost } = usePosts();

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

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading && posts.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "4px solid #fde68a",
            borderTopColor: "#f59e0b",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ marginTop: 16, fontSize: 13, color: "#a8a29e" }}>読み込み中...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {posts.map((p, i) => (
          <PostCard
            key={p.id}
            post={p}
            onLike={handleLike}
            onComment={onComment}
            onFollowCat={handleFollowCat}
            onDelete={deletePost}
            currentUserId={currentUserId}
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(16px)",
              transition: "all 0.5s ease " + (i * 0.12 + 0.2) + "s",
            }}
          />
        ))}
      </div>

      {loading && posts.length > 0 && (
        <div style={{ padding: "24px 16px", textAlign: "center" }}>
          <PawPrint size={24} style={{ color: "#d6d3d1", margin: "0 auto 8px" }} />
          <p style={{ fontSize: 12, color: "#a8a29e" }}>もっとニャンコの投稿を読み込み中...</p>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <PawPrint size={40} style={{ color: "#d6d3d1", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, color: "#78716c", fontWeight: 600 }}>まだ投稿がないよ</p>
          <p style={{ fontSize: 13, color: "#a8a29e", marginTop: 4 }}>最初の投稿をしてみよう!</p>
        </div>
      )}
    </div>
  );
}
