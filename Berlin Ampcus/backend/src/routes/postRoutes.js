import { Router } from "express";
import { createPostController, listApprovedPostsController } from "../controllers/postController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { postRateLimiter } from "../middleware/rateLimitMiddleware.js";
import { uploadPostImage } from "../middleware/uploadMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const postRouter = Router();

postRouter.get("/", asyncHandler(listApprovedPostsController));
postRouter.post("/", authenticate, postRateLimiter, uploadPostImage, asyncHandler(createPostController));
