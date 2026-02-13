import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { uploadImage } from "../utils/cloudinary";

const router = Router();

router.post("/image", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { image } = req.body;
    if (!image) {
      res.status(400).json({ error: "画像データが必要です" });
      return;
    }
    const url = await uploadImage(image);
    res.json({ url });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ error: "画像のアップロードに失敗しました" });
  }
});

export default router;
