import { Router, Request, Response, NextFunction } from "express";
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
    } catch {
      // invalid token — continue without auth
    }
  }
  next();
}

async function addLikedState(posts: any[], userId?: string) {
  if (!userId) return posts;
  const postIds = posts.map((p) => p.id);
  const likes = await prisma.like.findMany({
    where: { postId: { in: postIds }, userId },
    select: { postId: true },
  });
  const likedSet = new Set(likes.map((l) => l.postId));
  return posts.map((p) => ({ ...p, liked: likedSet.has(p.id) }));
}

async function addFollowState(posts: any[], userId?: string) {
  if (!userId) return posts;
  const catIds = [...new Set(posts.map((p: any) => p.catId))];
  const follows = await prisma.follow.findMany({
    where: { followerId: userId, catId: { in: catIds } },
    select: { catId: true },
  });
  const followingSet = new Set(follows.map((f) => f.catId));
  return posts.map((p: any) => ({
    ...p,
    isFollowingCat: followingSet.has(p.catId),
  }));
}

router.get("/user/:userId", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        cat: { select: { id: true, name: true, breed: true, photoUrl: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    const withLikes = await addLikedState(posts, req.userId);
    const result = await addFollowState(withLikes, req.userId);
    res.json(result);
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({ error: "投稿の取得に失敗しました" });
  }
});

router.get("/", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;

    const posts = await prisma.post.findMany({
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        cat: { select: { id: true, name: true, breed: true, photoUrl: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    const withLikes = await addLikedState(posts, req.userId);
    const result = await addFollowState(withLikes, req.userId);
    res.json(result);
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ error: "投稿の取得に失敗しました" });
  }
});

router.get("/:id", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        cat: { select: { id: true, name: true, breed: true, photoUrl: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { comments: true, likes: true } },
      },
    });

    if (!post) {
      res.status(404).json({ error: "投稿が見つかりません" });
      return;
    }

    let liked = false;
    let isFollowingCat = false;
    if (req.userId) {
      const like = await prisma.like.findUnique({
        where: { postId_userId: { postId: id, userId: req.userId } },
      });
      liked = !!like;
      const follow = await prisma.follow.findUnique({
        where: { followerId_catId: { followerId: req.userId, catId: post.catId } },
      });
      isFollowingCat = !!follow;
    }

    res.json({ ...post, liked, isFollowingCat });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ error: "投稿の取得に失敗しました" });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { content, imageUrl, videoUrl, catId, translation, mood, moodFace } = req.body;

    if (!content || !catId) {
      res.status(400).json({ error: "本文と猫の選択は必須です" });
      return;
    }

    const cat = await prisma.cat.findUnique({ where: { id: catId } });
    if (!cat || cat.userId !== req.userId) {
      res.status(400).json({ error: "猫が見つかりません" });
      return;
    }

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        catId,
        userId: req.userId!,
        translation: translation || null,
        mood: mood || null,
        moodFace: moodFace || null,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        cat: { select: { id: true, name: true, breed: true, photoUrl: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    res.status(201).json({ ...post, liked: false, isFollowingCat: false });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ error: "投稿に失敗しました" });
  }
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post || post.userId !== req.userId) {
      res.status(404).json({ error: "投稿が見つかりません" });
      return;
    }

    await prisma.post.delete({ where: { id } });
    res.json({ message: "削除しました" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: "投稿の削除に失敗しました" });
  }
});

router.get("/liked/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const likes = await prisma.like.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
            cat: { select: { id: true, name: true, breed: true, photoUrl: true } },
            _count: { select: { comments: true, likes: true } },
          },
        },
      },
    });
    const posts = likes.map((l: any) => ({ ...l.post, liked: true }));
    res.json(posts);
  } catch (error) {
    console.error("Get liked posts error:", error);
    res.status(500).json({ error: "いいねした投稿の取得に失敗しました" });
  }
});

router.post("/:id/like", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id as string;
    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId: req.userId! } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await prisma.like.count({ where: { postId } });
      res.json({ liked: false, count });
    } else {
      await prisma.like.create({
        data: { postId, userId: req.userId! },
      });
      const count = await prisma.like.count({ where: { postId } });
      res.json({ liked: true, count });
    }
  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({ error: "いいね操作に失敗しました" });
  }
});

router.post("/:id/comments", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id as string;
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: "コメントを入力してください" });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: req.userId!,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({ error: "コメントに失敗しました" });
  }
});

export default router;
