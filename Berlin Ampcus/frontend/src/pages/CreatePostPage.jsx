import { useState } from "react";
import { CreatePostForm } from "../components/CreatePostForm";
import { SectionHeader } from "../components/SectionHeader";
import { submitPost } from "../api/posts";

export function CreatePostPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(payload) {
    try {
      setBusy(true);
      setError("");
      const result = await submitPost(payload);
      setMessage(`${result.message} Status: ${result.post.status}. The worker will update it after the ML checks finish.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit post.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Create"
        title="Submit content into the moderation pipeline."
        description="Every post lands in the database as pending, gets enqueued for AI review, and stays available for human moderation if the system is unsure."
      />

      {message ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-danger">{error}</div> : null}

      <CreatePostForm onSubmit={handleSubmit} busy={busy} />
    </div>
  );
}
