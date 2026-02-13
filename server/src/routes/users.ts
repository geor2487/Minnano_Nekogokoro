import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// PUT /profile MUST be before GET /:id to avoid "profile" matching as :id
router.put(
  "/profile",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, bio, avatarUrl } = req.body;
      const user = await prisma.user.update({
        where: { id: req.userId },
        data: { name, bio, avatarUrl },
        select: { id: true, name: true, bio: true, avatarUrl: true },
      });
      res.json(user);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "プロフィールの更新に失敗しました" });
    }
  }
);

router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        _count: { select: { posts: true, following: true } },
        cats: {
          select: {
            id: true, name: true, breed: true, photoUrl: true,
            _count: { select: { followers: true } },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "ユーザーが見つかりません" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "ユーザーの取得に失敗しました" });
  }
});

router.get("/:id/following", async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const following = await prisma.follow.findMany({
      where: { followerId: id },
      select: {
        cat: {
          select: {
            id: true,
            name: true,
            breed: true,
            photoUrl: true,
            user: { select: { id: true, name: true, avatarUrl: true } },
            _count: { select: { followers: true } },
          },
        },
      },
    });
    res.json(following.map((f: any) => f.cat));
  } catch (error) {
    console.error("Get following cats error:", error);
    res.status(500).json({ error: "フォロー中の猫の取得に失敗しました" });
  }
});

export default router;
