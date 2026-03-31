import { createPostSchema } from "../validators/postValidators.js";
import { createPost, listApprovedPosts } from "../services/postService.js";

export async function createPostController(req, res) {
  const payload = await createPostSchema.validateAsync(req.body);
  const post = await createPost({
    authorId: req.user.sub,
    textContent: payload.textContent,
    file: req.file
  });

  return res.status(201).json({
    message: "Post submitted for moderation.",
    post
  });
}

export async function listApprovedPostsController(_req, res) {
  const posts = await listApprovedPosts();
  return res.status(200).json({ posts });
}
