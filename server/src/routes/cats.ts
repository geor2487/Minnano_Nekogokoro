import { Router, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      req.userId = decoded.userId;
    } catch {}
  }
  next();
}

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const cats = await prisma.cat.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { followers: true } } },
    });
    res.json(cats);
  } catch (error) {
    console.error("Get cats error:", error);
    res.status(500).json({ error: "猫の取得に失敗しました" });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, breed, age, gender, personality, photoUrl } = req.body;

    if (!name || !breed || age === undefined || !gender) {
      res.status(400).json({ error: "名前、猫種、年齢、性別は必須です" });
      return;
    }

    const cat = await prisma.cat.create({
      data: {
        name,
        breed,
        age: Number(age),
        gender,
        personality: personality || null,
        photoUrl: photoUrl || null,
        userId: req.userId!,
      },
    });

    res.status(201).json(cat);
  } catch (error) {
    console.error("Create cat error:", error);
    res.status(500).json({ error: "猫の登録に失敗しました" });
  }
});

// Follow endpoints (before /:id to avoid path conflicts)
router.post("/:id/follow", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const catId = req.params.id as string;
    const cat = await prisma.cat.findUnique({ where: { id: catId } });
    if (!cat) {
      res.status(404).json({ error: "猫が見つかりません" });
      return;
    }
    if (cat.userId === req.userId) {
      res.status(400).json({ error: "自分の猫はフォローできません" });
      return;
    }
    const existing = await prisma.follow.findUnique({
      where: { followerId_catId: { followerId: req.userId!, catId } },
    });
    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      const count = await prisma.follow.count({ where: { catId } });
      res.json({ following: false, count });
    } else {
      await prisma.follow.create({ data: { followerId: req.userId!, catId } });
      const count = await prisma.follow.count({ where: { catId } });
      res.json({ following: true, count });
    }
  } catch (error) {
    console.error("Follow cat error:", error);
    res.status(500).json({ error: "フォロー操作に失敗しました" });
  }
});

router.get("/:id/followers", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const catId = req.params.id as string;
    const followers = await prisma.follow.findMany({
      where: { catId },
      select: {
        follower: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    res.json(followers.map((f: any) => f.follower));
  } catch (error) {
    console.error("Get cat followers error:", error);
    res.status(500).json({ error: "フォロワーの取得に失敗しました" });
  }
});

router.get("/:id/posts", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const catId = req.params.id as string;
    const posts = await prisma.post.findMany({
      where: { catId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        cat: { select: { id: true, name: true, breed: true, photoUrl: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
    res.json(posts);
  } catch (error) {
    console.error("Get cat posts error:", error);
    res.status(500).json({ error: "投稿の取得に失敗しました" });
  }
});

router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const cat = await prisma.cat.findUnique({ where: { id } });
    if (!cat || cat.userId !== req.userId) {
      res.status(404).json({ error: "猫が見つかりません" });
      return;
    }

    const { name, breed, age, gender, personality, photoUrl } = req.body;
    const updated = await prisma.cat.update({
      where: { id },
      data: {
        name,
        breed,
        age: age !== undefined ? Number(age) : undefined,
        gender,
        personality: personality || null,
        photoUrl: photoUrl !== undefined ? (photoUrl || null) : undefined,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Update cat error:", error);
    res.status(500).json({ error: "猫の更新に失敗しました" });
  }
});

router.delete(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const cat = await prisma.cat.findUnique({ where: { id } });
      if (!cat || cat.userId !== req.userId) {
        res.status(404).json({ error: "猫が見つかりません" });
        return;
      }

      await prisma.cat.delete({ where: { id } });
      res.json({ message: "削除しました" });
    } catch (error) {
      console.error("Delete cat error:", error);
      res.status(500).json({ error: "猫の削除に失敗しました" });
    }
  }
);

export default router;
