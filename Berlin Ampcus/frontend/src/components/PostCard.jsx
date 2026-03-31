import { API_ORIGIN } from "../api/client";

function getImageSource(imageUrl) {
  if (!imageUrl) {
    return "";
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  const uploadsIndex = imageUrl.indexOf("/uploads/");
  if (uploadsIndex >= 0) {
    return `${API_ORIGIN}${imageUrl.slice(uploadsIndex)}`;
  }

  return `${API_ORIGIN}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}

export function PostCard({ post, showModeration = false, onResolve, busyAction }) {
  const scores = post.confidenceScores || {};

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-card">
      {post.imageUrl ? (
        <img
          src={getImageSource(post.imageUrl)}
          alt="User submission"
          className="h-56 w-full object-cover"
        />
      ) : null}

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{post.status}</p>
            <p className="mt-1 text-base font-semibold text-ink">{post.authorId?.username || "Unknown user"}</p>
          </div>
          {post.flags?.length ? (
            <div className="flex flex-wrap gap-2">
              {post.flags.map((flag) => (
                <span key={flag} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-danger">
                  {flag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{post.textContent}</p>

        <div className="grid gap-3 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600 md:grid-cols-3">
          <div>
            <p className="font-semibold text-slate-800">Toxicity</p>
            <p>{Number(scores.toxicity || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Misinformation</p>
            <p>{Number(scores.misinformation || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-800">NSFW</p>
            <p>{Number(scores.nsfw || 0).toFixed(2)}</p>
          </div>
        </div>

        {showModeration ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busyAction}
              onClick={() => onResolve(post._id, "APPROVE")}
              className="rounded-2xl bg-accent px-4 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:opacity-70"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={busyAction}
              onClick={() => onResolve(post._id, "REJECT")}
              className="rounded-2xl bg-danger px-4 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:opacity-70"
            >
              Reject
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
