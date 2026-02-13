import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { performConsultation } from "../services/consult";

const router = Router();

// POST /api/consult — 相談実行（翻訳のみ、保存しない）
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { catId, inputType, inputText, imageBase64, videoFrames } = req.body;

    if (!catId || !inputType) {
      res.status(400).json({ error: "必要な情報が不足しています" });
      return;
    }

    if (inputType === "text" && !inputText) {
      res.status(400).json({ error: "テキストを入力してください" });
      return;
    }
    if (inputType === "photo" && !imageBase64) {
      res.status(400).json({ error: "写真を選択してください" });
      return;
    }
    if (inputType === "video" && (!videoFrames || videoFrames.length === 0)) {
      res.status(400).json({ error: "動画を選択してください" });
      return;
    }

    // 動画は1日3回まで
    if (inputType === "video") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const count = await prisma.consultation.count({
        where: {
          userId: req.userId!,
          inputType: "video",
          createdAt: { gte: today },
        },
      });
      if (count >= 3) {
        res.status(429).json({ error: "動画相談は1日3回までです" });
        return;
      }
    }

    const cat = await prisma.cat.findFirst({
      where: { id: catId, userId: req.userId! },
    });
    if (!cat) {
      res.status(404).json({ error: "猫が見つかりません" });
      return;
    }

    const result = await performConsultation({
      cat: {
        name: cat.name,
        breed: cat.breed,
        age: cat.age,
        gender: cat.gender,
        personality: cat.personality,
      },
      inputType,
      inputText,
      imageBase64,
      videoFrames,
    });

    res.json(result);
  } catch (error) {
    console.error("Consult error:", error);
    res.status(500).json({ error: "翻訳に失敗しました。もう一度お試しください" });
  }
});

// POST /api/consult/save — 結果を保存
router.post("/save", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { catId, inputType, inputText, mediaUrl, frameCount, feeling, explanation, advice, mood } = req.body;

    const consultation = await prisma.consultation.create({
      data: {
        userId: req.userId!,
        catId,
        inputType,
        inputText: inputText || null,
        mediaUrl: mediaUrl || null,
        frameCount: frameCount || null,
        feeling,
        explanation,
        advice,
        mood,
      },
      include: { cat: { select: { id: true, name: true, breed: true, photoUrl: true } } },
    });

    res.json(consultation);
  } catch (error) {
    console.error("Save consultation error:", error);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// GET /api/consult/history — 相談履歴一覧
router.get("/history", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const consultations = await prisma.consultation.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
      include: { cat: { select: { id: true, name: true, breed: true, photoUrl: true } } },
    });
    res.json(consultations);
  } catch (error) {
    console.error("Fetch history error:", error);
    res.status(500).json({ error: "履歴の取得に失敗しました" });
  }
});

// DELETE /api/consult/history/:id — 相談削除
router.delete("/history/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const consultation = await prisma.consultation.findFirst({
      where: { id, userId: req.userId! },
    });
    if (!consultation) {
      res.status(404).json({ error: "相談が見つかりません" });
      return;
    }
    await prisma.consultation.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete consultation error:", error);
    res.status(500).json({ error: "削除に失敗しました" });
  }
});

// GET /api/consult/video-count — 本日の動画相談回数
router.get("/video-count", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await prisma.consultation.count({
      where: {
        userId: req.userId!,
        inputType: "video",
        createdAt: { gte: today },
      },
    });
    res.json({ count });
  } catch (error) {
    console.error("Fetch video count error:", error);
    res.status(500).json({ error: "カウントの取得に失敗しました" });
  }
});

export default router;
