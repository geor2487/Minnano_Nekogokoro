import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { orchestrateTranslation } from "../services/translate";

const router = Router();


router.post(
  "/",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { catId, text, imageBase64 } = req.body;

      if (!catId || !text) {
        res.status(400).json({ error: "猫の選択とテキストは必須です" });
        return;
      }

      const cat = await prisma.cat.findUnique({ where: { id: catId } });
      if (!cat || cat.userId !== req.userId) {
        res.status(400).json({ error: "猫が見つかりません" });
        return;
      }

      const result = await orchestrateTranslation({
        cat: {
          name: cat.name,
          breed: cat.breed,
          age: cat.age,
          gender: cat.gender,
          personality: cat.personality || undefined,
        },
        text,
        imageBase64,
      });

      res.json(result);
    } catch (error) {
      console.error("Translate error:", error);
      res.status(500).json({ error: "翻訳に失敗しました。もう一度お試しください" });
    }
  }
);

export default router;
