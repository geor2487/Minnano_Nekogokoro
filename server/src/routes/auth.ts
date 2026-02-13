import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "メール、パスワード、名前は必須です" });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: "このメールアドレスは既に使用されています" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "登録に失敗しました" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "メールとパスワードは必須です" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "メールアドレスまたはパスワードが間違っています" });
      return;
    }

    if (!user.password) {
      res.status(400).json({ error: "このアカウントはGoogleログインで登録されています" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: "メールアドレスまたはパスワードが間違っています" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "ログインに失敗しました" });
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        _count: { select: { posts: true, following: true } },
      },
    });

    if (!user) {
      res.status(404).json({ error: "ユーザーが見つかりません" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ error: "ユーザー情報の取得に失敗しました" });
  }
});

router.post("/google", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: "トークンが必要です" });
      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ error: "無効なトークンです" });
      return;
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find existing user by googleId
    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      // Check if user exists with same email (link accounts)
      user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        // Link Google account to existing email user
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatarUrl: user.avatarUrl || picture },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split("@")[0],
            googleId,
            avatarUrl: picture || null,
          },
        });
      }
    }

    const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ error: "Google認証に失敗しました" });
  }
});

// パスワード変更
router.put(
  "/password",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ error: "現在のパスワードと新しいパスワードは必須です" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "新しいパスワードは6文字以上で入力してください" });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });

      if (!user) {
        return res.status(404).json({ error: "ユーザーが見つかりません" });
      }

      if (!user.password) {
        return res
          .status(400)
          .json({ error: "Google認証のアカウントはパスワードを変更できません" });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res
          .status(401)
          .json({ error: "現在のパスワードが正しくありません" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: req.userId },
        data: { password: hashedPassword },
      });

      res.json({ message: "パスワードを変更しました" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ error: "パスワードの変更に失敗しました" });
    }
  }
);

// アカウント削除
router.delete(
  "/account",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { password } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });

      if (!user) {
        return res.status(404).json({ error: "ユーザーが見つかりません" });
      }

      // パスワード認証ユーザーの場合はパスワード検証が必要
      if (user.password) {
        if (!password) {
          return res
            .status(400)
            .json({ error: "アカウント削除にはパスワードの入力が必要です" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return res
            .status(401)
            .json({ error: "パスワードが正しくありません" });
        }
      }

      await prisma.user.delete({
        where: { id: req.userId },
      });

      res.json({ message: "アカウントを削除しました" });
    } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({ error: "アカウントの削除に失敗しました" });
    }
  }
);

export default router;
