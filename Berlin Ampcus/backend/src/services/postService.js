import { Post } from "../models/Post.js";
import { env } from "../config/env.js";
import { moderationQueue } from "../queues/moderationQueue.js";
import { ApiError } from "../utils/errors.js";

function publicImagePath(file) {
  if (!file) {
    return "";
  }

  return `/${env.uploadDir}/${file.filename}`;
}

export async function createPost({ authorId, textContent, file }) {
  const post = await Post.create({
    authorId,
    textContent,
    imageUrl: publicImagePath(file),
    status: "PENDING",
    moderationAuditLog: [
      {
        event: "POST_CREATED",
        actorId: authorId,
        details: { hasImage: Boolean(file) }
      }
    ]
  });

  await moderationQueue.add("moderate-post", { postId: post._id.toString() });
  return post;
}

export async function listApprovedPosts() {
  return Post.find({ status: "APPROVED" })
    .populate("authorId", "username role")
    .sort({ createdAt: -1 })
    .lean();
}

export async function listFlaggedPosts() {
  return Post.find({ status: "FLAGGED" })
    .populate("authorId", "username role")
    .sort({ updatedAt: -1 })
    .lean();
}

export async function getModerationStats() {
  const [approved, flagged, pending, rejected] = await Promise.all([
    Post.countDocuments({ status: "APPROVED" }),
    Post.countDocuments({ status: "FLAGGED" }),
    Post.countDocuments({ status: "PENDING" }),
    Post.countDocuments({ status: "REJECTED" })
  ]);

  const totalReviewed = approved + flagged + rejected;
  const flaggedRatio = totalReviewed > 0 ? flagged / totalReviewed : 0;

  return {
    approved,
    flagged,
    pending,
    rejected,
    flaggedRatio: Number(flaggedRatio.toFixed(4))
  };
}

export async function resolveFlaggedPost(postId, moderatorId, action) {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found.");
  }

  if (post.status !== "FLAGGED") {
    throw new ApiError(400, "Only flagged posts can be resolved.");
  }

  post.status = action === "APPROVE" ? "APPROVED" : "REJECTED";
  post.moderationAuditLog.push({
    event: "MODERATOR_RESOLUTION",
    actorId: moderatorId,
    details: {
      action,
      isFalsePositive: action === "APPROVE"
    }
  });

  await post.save();
  return post;
}
