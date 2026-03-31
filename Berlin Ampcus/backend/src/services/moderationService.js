import { Post } from "../models/Post.js";
import { moderateImage, moderateText } from "./mlService.js";

const TOXIC_FLAG_THRESHOLD = 0.7;
const TOXIC_REVIEW_THRESHOLD = 0.4;
const NSFW_FLAG_THRESHOLD = 0.6;
const NSFW_REVIEW_THRESHOLD = 0.4;
const MISINFORMATION_REVIEW_THRESHOLD = 0.4;

function normalizeFlags(values = []) {
  return [...new Set(values.map((value) => value.split(":")[0]))];
}

export function derivePostStatus({ toxicity, misinformation, nsfw }) {
  const requiresFlag =
    toxicity >= TOXIC_FLAG_THRESHOLD ||
    nsfw >= NSFW_FLAG_THRESHOLD ||
    toxicity >= TOXIC_REVIEW_THRESHOLD ||
    nsfw >= NSFW_REVIEW_THRESHOLD ||
    misinformation >= MISINFORMATION_REVIEW_THRESHOLD;

  return requiresFlag ? "FLAGGED" : "APPROVED";
}

export async function moderatePostById(postId) {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error(`Post ${postId} not found.`);
  }

  const [textResult, imageResult] = await Promise.all([
    moderateText(post.textContent),
    moderateImage(post.imageUrl)
  ]);

  const toxicity = textResult.score_breakdown?.toxicity || 0;
  const misinformation = textResult.score_breakdown?.misinformation || 0;
  const nsfw = imageResult.score_breakdown?.nsfw || 0;
  const overall = Math.max(toxicity, misinformation, nsfw);
  const status = derivePostStatus({ toxicity, misinformation, nsfw });
  const flags = normalizeFlags([
    ...(textResult.flag_reasons || []),
    ...(imageResult.flag_reasons || [])
  ]);
  const notes = [...(textResult.notes || []), ...(imageResult.notes || [])];

  post.status = status;
  post.flags = flags;
  post.confidenceScores = {
    toxicity,
    misinformation,
    nsfw,
    overall
  };
  post.moderationReasons = [...(textResult.flag_reasons || []), ...(imageResult.flag_reasons || [])];
  post.mlNotes = notes;
  post.lastModeratedAt = new Date();
  post.moderationAuditLog.push({
    event: "ML_MODERATION_COMPLETED",
    details: {
      status,
      flags,
      confidenceScores: post.confidenceScores
    }
  });

  await post.save();

  return post;
}

export async function markPostModerationFailure(postId, errorMessage) {
  const post = await Post.findById(postId);
  if (!post) {
    return;
  }

  post.failureCount += 1;
  post.status = "PENDING";
  post.flags = post.flags.filter((flag) => flag !== "ML_FAILURE");
  post.mlNotes = [
    ...new Set([
      ...post.mlNotes,
      "Moderation is still processing. The ML service did not return a result yet."
    ])
  ];
  post.moderationAuditLog.push({
    event: "ML_MODERATION_FAILED",
    details: {
      errorMessage,
      failureCount: post.failureCount
    }
  });

  await post.save();
}
