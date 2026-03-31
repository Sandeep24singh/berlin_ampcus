import { Router } from "express";
import {
  getModerationQueueController,
  getModerationStatsController,
  resolveModerationController
} from "../controllers/moderationController.js";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const moderationRouter = Router();

moderationRouter.use(authenticate, requireRole("MODERATOR"));
moderationRouter.get("/queue", asyncHandler(getModerationQueueController));
moderationRouter.get("/stats", asyncHandler(getModerationStatsController));
moderationRouter.post("/:postId/resolve", asyncHandler(resolveModerationController));
