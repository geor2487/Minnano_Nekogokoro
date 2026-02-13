import { Router, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

const router = Router();

function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      req.userId = decoded.userId;
    } catch {
      // invalid token
    }
  }
  next();
}

router.get("/", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const q = (req.query.q as string) || "";
    const type = (req.query.type as string) || "latest";
    const limit = parseInt(req.query.limit as string) || 20;

    if (type === "breeds") {
      const cats = await prisma.cat.findMany({
        where: q
          ? { breed: { contains: q, mode: "insensitive" } }
          : undefined,
        select: { breed: true },
        distinct: ["breed"],
        take: 20,
      });
      res.json(cats.map((c: { breed: string }) => c.breed));
      return;
    }

    const where = q
      ? {
          OR: [
            { content: { contains: q, mode: "insensitive" as const } },
            { user: { name: { contains: q, mode: "insensitive" as const } } },
            { cat: { name: { contains: q, mode: "insensitive" as const } } },
            { cat: { breed: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {};

    const orderBy =
      type === "popular"
        ? { likes: { _count: "desc" as const } }
        : { createdAt: "desc" as const };

    const posts = await prisma.post.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        cat: { select: { id: true, name: true, breed: true, photoUrl: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    // Add liked + follow state if authenticated
    if (req.userId) {
      const postIds = posts.map((p) => p.id);
      const likes = await prisma.like.findMany({
        where: { postId: { in: postIds }, userId: req.userId },
        select: { postId: true },
      });
      const likedSet = new Set(likes.map((l) => l.postId));

      const catIds = [...new Set(posts.map((p) => p.catId))];
      const follows = await prisma.follow.findMany({
        where: { followerId: req.userId, catId: { in: catIds } },
        select: { catId: true },
      });
      const followingSet = new Set(follows.map((f) => f.catId));

      const result = posts.map((p) => ({
        ...p,
        liked: likedSet.has(p.id),
        isFollowingCat: followingSet.has(p.catId),
      }));
      res.json(result);
    } else {
      res.json(posts);
    }
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "検索に失敗しました" });
  }
});

export default router;
