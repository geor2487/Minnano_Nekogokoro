import { useState, useCallback } from "react";
import api from "../lib/api";
import type { Post } from "../types";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPosts = useCallback(
    async (q: string, type: string = "latest") => {
      setLoading(true);
      try {
        const res = await api.get("/search", { params: { q, type } });
        setPosts(res.data);
      } catch (error) {
        console.error("Failed to search posts:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const toggleLike = useCallback(async (postId: string) => {
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
  }, []);

  const createPost = useCallback(
    async (data: {
      content: string;
      catId: string;
      imageUrl?: string;
      videoUrl?: string;
      translation?: string;
      mood?: string;
      moodFace?: string;
    }) => {
      const res = await api.post("/posts", data);
      setPosts((prev) => [res.data, ...prev]);
      return res.data;
    },
    []
  );

  const toggleFollowCat = useCallback(async (catId: string) => {
    try {
      const res = await api.post(`/cats/${catId}/follow`);
      setPosts((prev) =>
        prev.map((p) =>
          p.catId === catId
            ? { ...p, isFollowingCat: res.data.following }
            : p
        )
      );
      return res.data as { following: boolean; count: number };
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    await api.delete(`/posts/${postId}`);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  return { posts, loading, fetchPosts, searchPosts, toggleLike, createPost, toggleFollowCat, deletePost };
}
