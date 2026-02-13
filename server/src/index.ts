import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import catsRouter from "./routes/cats";
import postsRouter from "./routes/posts";
import searchRouter from "./routes/search";
import translateRouter from "./routes/translate";
import uploadRouter from "./routes/upload";
import consultRouter from "./routes/consult";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.CLIENT_URL,
    ].filter(Boolean);
    if (allowed.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/cats", catsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/search", searchRouter);
app.use("/api/translate", translateRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/consult", consultRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
