import { moderationResolveSchema } from "../validators/postValidators.js";
import { getModerationStats, listFlaggedPosts, resolveFlaggedPost } from "../services/postService.js";

export async function getModerationQueueController(_req, res) {
  const posts = await listFlaggedPosts();
  return res.status(200).json({ posts });
}

export async function getModerationStatsController(_req, res) {
  const stats = await getModerationStats();
  return res.status(200).json({ stats });
}

export async function resolveModerationController(req, res) {
  const payload = await moderationResolveSchema.validateAsync(req.body);
  const post = await resolveFlaggedPost(req.params.postId, req.user.sub, payload.action);
  return res.status(200).json({
    message: `Post ${payload.action === "APPROVE" ? "approved" : "rejected"}.`,
    post
  });
}
