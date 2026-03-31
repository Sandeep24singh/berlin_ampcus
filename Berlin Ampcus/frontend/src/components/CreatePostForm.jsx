import { useState } from "react";

export function CreatePostForm({ onSubmit, busy }) {
  const [textContent, setTextContent] = useState("");
  const [image, setImage] = useState(null);

  return (
    <form
      className="rounded-[28px] bg-white p-6 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ textContent, image });
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink">Create a post</h2>
          <p className="mt-1 text-sm text-slate-500">
            Submissions are saved immediately and processed asynchronously by the moderation worker.
          </p>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-warning">
          Async moderation
        </span>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Text content</span>
        <textarea
          rows="6"
          className="w-full rounded-3xl border border-slate-200 px-4 py-4 outline-none transition focus:border-accent"
          placeholder="Share an update, comment, or announcement..."
          value={textContent}
          onChange={(event) => setTextContent(event.target.value)}
          required
        />
      </label>

      <label className="mt-4 block rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
        <span className="block text-sm font-medium text-slate-700">Optional image</span>
        <span className="mt-1 block text-xs text-slate-500">PNG, JPG, or WEBP up to 5 MB.</span>
        <input
          type="file"
          accept="image/*"
          className="mt-4 block w-full text-sm text-slate-600"
          onChange={(event) => setImage(event.target.files?.[0] || null)}
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        className="mt-5 rounded-2xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? "Submitting..." : "Submit for moderation"}
      </button>
    </form>
  );
}
