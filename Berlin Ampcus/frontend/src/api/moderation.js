import { apiClient } from "./client";

export async function fetchFlaggedPosts() {
  const response = await apiClient.get("/moderation/queue");
  return response.data.posts;
}

export async function fetchModerationStats() {
  const response = await apiClient.get("/moderation/stats");
  return response.data.stats;
}

export async function resolveModeration(postId, action) {
  const response = await apiClient.post(`/moderation/${postId}/resolve`, { action });
  return response.data;
}
