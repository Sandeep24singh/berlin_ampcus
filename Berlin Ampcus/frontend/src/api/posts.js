import { apiClient } from "./client";

export async function fetchApprovedPosts() {
  const response = await apiClient.get("/posts");
  return response.data.posts;
}

export async function submitPost(payload) {
  const formData = new FormData();
  formData.append("textContent", payload.textContent);
  if (payload.image) {
    formData.append("image", payload.image);
  }

  const response = await apiClient.post("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data;
}
