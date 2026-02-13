import { useState, useEffect, useRef, useCallback } from "react";
import api from "../lib/api";
import type { Post } from "../types";
import PostCard from "../components/PostCard";

type TabType = "latest" | "popular" | "breeds";

interface Breed {
  breed: string;
  count: number;
}

// ---- Inline SVG Icons ----

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ---- Component ----

export default function Search() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("latest");
  const [posts, setPosts] = useState<Post[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [selectedBreed, setSelectedBreed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search posts (latest / popular)
  const searchPosts = useCallback(
    async (q: string, type: TabType) => {
      setLoading(true);
      try {
        const res = await api.get("/search", { params: { q, type } });
        setPosts(res.data);
      } catch (error) {
        console.error("Failed to search:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch breeds
  const fetchBreeds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/search", { params: { type: "breeds" } });
      setBreeds(res.data);
    } catch (error) {
      console.error("Failed to fetch breeds:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Like handler
  const handleLike = async (postId: string) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                liked: res.data.liked,
                _count: { ...p._count, likes: res.data.count },
              }
            : p
        )
      );
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  // Debounced search on query change
  useEffect(() => {
    if (activeTab === "breeds" && !selectedBreed) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const searchQuery = activeTab === "breeds" && selectedBreed ? selectedBreed : query;
      const searchType: TabType = activeTab === "breeds" ? "latest" : activeTab;
      searchPosts(searchQuery, searchType);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, activeTab, selectedBreed, searchPosts]);

  // Fetch breeds when breeds tab is selected
  useEffect(() => {
    if (activeTab === "breeds") {
      setSelectedBreed(null);
      fetchBreeds();
    }
  }, [activeTab, fetchBreeds]);

  // Initial load
  useEffect(() => {
    searchPosts("", "latest");
  }, [searchPosts]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab !== "breeds") {
      setSelectedBreed(null);
    }
  };

  const handleBreedSelect = (breed: string) => {
    setSelectedBreed(breed);
    setQuery(breed);
  };

  const sectionLabel =
    activeTab === "latest"
      ? "みんなの最新投稿"
      : activeTab === "popular"
        ? "いいねが多い投稿"
        : null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Search Bar */}
      <div className="bg-white rounded-[14px] border border-stone-200 px-3.5 py-2.5 flex items-center gap-2.5 mb-3.5">
        <SearchIcon className="h-[18px] w-[18px] text-stone-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="猫種、ユーザー名で検索..."
          className="border-none outline-none text-sm text-stone-800 bg-transparent flex-1 font-[inherit]"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4">
        <button
          onClick={() => handleTabChange("latest")}
          className={`rounded-full px-3.5 py-[7px] text-[13px] font-semibold flex items-center transition-colors ${
            activeTab === "latest"
              ? "bg-amber-500 text-white"
              : "bg-stone-100 text-stone-500"
          }`}
        >
          <svg className="h-3.5 w-3.5 mr-[3px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          最新
        </button>
        <button
          onClick={() => handleTabChange("popular")}
          className={`rounded-full px-3.5 py-[7px] text-[13px] font-semibold flex items-center transition-colors ${
            activeTab === "popular"
              ? "bg-amber-500 text-white"
              : "bg-stone-100 text-stone-500"
          }`}
        >
          <svg className="h-3.5 w-3.5 mr-[3px]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 23c-4.97 0-8-3.58-8-8 0-3.07 2.1-6.3 4.2-8.7.6-.68 1.64-.16 1.5.74-.3 1.9.5 3.06 1.3 3.56.1-2.4 1.4-5.2 3.2-7.1.5-.52 1.4-.12 1.3.6-.2 1.5.3 3.2 1.2 4.3C18.2 10.7 20 13.3 20 15c0 4.42-3.03 8-8 8z"/>
          </svg>
          人気
        </button>
        <button
          onClick={() => handleTabChange("breeds")}
          className={`rounded-full px-3.5 py-[7px] text-[13px] font-semibold flex items-center transition-colors ${
            activeTab === "breeds"
              ? "bg-amber-500 text-white"
              : "bg-stone-100 text-stone-500"
          }`}
        >
          <svg className="h-[13px] w-[13px] mr-[3px]" viewBox="0 0 24 24" fill="currentColor">
            <ellipse cx="12" cy="16" rx="5" ry="4"/>
            <circle cx="7" cy="9" r="2.2"/>
            <circle cx="12" cy="7" r="2.2"/>
            <circle cx="17" cy="9" r="2.2"/>
            <circle cx="5" cy="13" r="1.8"/>
            <circle cx="19" cy="13" r="1.8"/>
          </svg>
          猫種
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-amber-300 border-t-amber-500 rounded-full animate-spin" />
          <p className="mt-4 text-gray-400 text-sm">検索中...</p>
        </div>
      ) : activeTab === "breeds" && !selectedBreed ? (
        /* Breed list */
        <div>
          <p className="text-xs text-stone-400 mb-2.5">猫種から探す</p>
          <div className="flex flex-wrap gap-2">
            {breeds.map((b) => (
              <button
                key={b.breed}
                onClick={() => handleBreedSelect(b.breed)}
                className="px-3.5 py-1.5 rounded-full border border-stone-200 bg-white text-[13px] font-medium text-stone-600"
              >
                {b.breed}
              </button>
            ))}
          </div>
          {breeds.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p>猫種が見つからないよ</p>
            </div>
          )}
        </div>
      ) : (
        /* Post list */
        <div>
          {sectionLabel && (
            <p className="text-xs text-stone-400 mb-1">{sectionLabel}</p>
          )}
          <div className="flex flex-col gap-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))}
            {posts.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p>投稿が見つからないよ</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
