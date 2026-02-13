import { useState, useCallback } from "react";
import api from "../lib/api";
import type { ConsultResult, Consultation } from "../types";

export function useConsult() {
  const [consulting, setConsulting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [videoCount, setVideoCount] = useState(0);

  const consult = useCallback(
    async (data: {
      catId: string;
      inputType: string;
      inputText?: string;
      imageBase64?: string;
      videoFrames?: string[];
    }): Promise<ConsultResult> => {
      setConsulting(true);
      try {
        const res = await api.post("/consult", data);
        return res.data;
      } finally {
        setConsulting(false);
      }
    },
    []
  );

  const saveResult = useCallback(
    async (data: {
      catId: string;
      inputType: string;
      inputText?: string;
      mediaUrl?: string;
      frameCount?: number;
      feeling: string;
      explanation: string;
      advice: string;
      mood: string;
    }): Promise<Consultation> => {
      setSaving(true);
      try {
        const res = await api.post("/consult/save", data);
        return res.data;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const fetchVideoCount = useCallback(async () => {
    try {
      const res = await api.get("/consult/video-count");
      setVideoCount(res.data.count);
      return res.data.count as number;
    } catch {
      return 0;
    }
  }, []);

  const fetchHistory = useCallback(async (): Promise<Consultation[]> => {
    const res = await api.get("/consult/history");
    return res.data;
  }, []);

  return { consult, saveResult, fetchVideoCount, fetchHistory, consulting, saving, videoCount };
}
