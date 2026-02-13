import { useState, useCallback } from "react";
import api from "../lib/api";
import type { Cat } from "../types";

export function useCats() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/cats");
      setCats(res.data);
    } catch (error) {
      console.error("Failed to fetch cats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCat = useCallback(
    async (data: {
      name: string;
      breed: string;
      age: number;
      gender: string;
      personality?: string;
      photoUrl?: string;
    }) => {
      const res = await api.post("/cats", data);
      setCats((prev) => [...prev, res.data]);
      return res.data;
    },
    []
  );

  const updateCat = useCallback(
    async (
      id: string,
      data: Partial<{
        name: string;
        breed: string;
        age: number;
        gender: string;
        personality: string;
        photoUrl: string;
      }>
    ) => {
      const res = await api.put(`/cats/${id}`, data);
      setCats((prev) => prev.map((c) => (c.id === id ? res.data : c)));
      return res.data;
    },
    []
  );

  const deleteCat = useCallback(async (id: string) => {
    await api.delete(`/cats/${id}`);
    setCats((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const followCat = useCallback(async (catId: string) => {
    const res = await api.post(`/cats/${catId}/follow`);
    return res.data as { following: boolean; count: number };
  }, []);

  return { cats, loading, fetchCats, createCat, updateCat, deleteCat, followCat };
}
