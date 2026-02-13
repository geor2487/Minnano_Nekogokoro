import { useEffect, useState } from "react";
import { usePosts } from "../hooks/usePosts";
import PostCard from "../components/PostCard";

export default function Home() {
  const { posts, loading, fetchPosts, toggleLike } = usePosts();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLike = (postId: string) => {
    toggleLike(postId);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 py-2">
      {loading && posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-amber-300 border-t-amber-500 rounded-full animate-spin" />
          <p className="mt-4 text-gray-400 text-sm">読み込み中...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map((post, index) => {
            const delay = index * 0.12 + 0.2;
            return (
              <div
                key={post.id}
                style={{
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? 'translateY(0)' : 'translateY(16px)',
                  transition: `all 0.5s ease ${delay}s`,
                }}
              >
                <PostCard post={post} onLike={handleLike} />
              </div>
            );
          })}
        </div>
      )}

      {loading && posts.length > 0 && (
        <div className="flex flex-col items-center py-10">
          <svg className="mx-auto mb-2 h-6 w-6 text-stone-300" viewBox="0 0 24 24" fill="currentColor">
            <ellipse cx="12" cy="16" rx="5" ry="4"/>
            <circle cx="7" cy="9" r="2.2"/>
            <circle cx="12" cy="7" r="2.2"/>
            <circle cx="17" cy="9" r="2.2"/>
            <circle cx="5" cy="13" r="1.8"/>
            <circle cx="19" cy="13" r="1.8"/>
          </svg>
          <p className="text-xs text-stone-400">もっとニャンコの投稿を読み込み中...</p>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p>まだ投稿がないよ</p>
        </div>
      )}
    </div>
  );
}
