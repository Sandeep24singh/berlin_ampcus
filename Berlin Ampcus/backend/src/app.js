import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env.js";
import { authRouter } from "./routes/authRoutes.js";
import { moderationRouter } from "./routes/moderationRoutes.js";
import { postRouter } from "./routes/postRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

export function createApp() {
  const app = express();
  const allowedOrigins = new Set([env.clientUrl, "http://127.0.0.1:5173", "http://localhost:5173"]);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS.`));
      },
      credentials: true
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use(`/${env.uploadDir}`, express.static(path.resolve(process.cwd(), env.uploadDir)));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/posts", postRouter);
  app.use("/api/moderation", moderationRouter);
  app.use(errorMiddleware);

  return app;
}
