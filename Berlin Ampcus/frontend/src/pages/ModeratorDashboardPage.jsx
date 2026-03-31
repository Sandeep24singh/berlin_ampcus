import { useEffect, useState } from "react";
import { fetchFlaggedPosts, fetchModerationStats, resolveModeration } from "../api/moderation";
import { PostCard } from "../components/PostCard";
import { SectionHeader } from "../components/SectionHeader";

export function ModeratorDashboardPage() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([fetchFlaggedPosts(), fetchModerationStats()])
      .then(([flaggedPosts, moderationStats]) => {
        if (active) {
          setPosts(flaggedPosts);
          setStats(moderationStats);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleResolve(postId, action) {
    setBusyAction(postId);
    try {
      await resolveModeration(postId, action);
      setPosts((current) => current.filter((post) => post._id !== postId));
      setStats((current) => {
        if (!current) {
          return current;
        }

        const nextStats = {
          ...current,
          flagged: Math.max(0, current.flagged - 1),
          approved: action === "APPROVE" ? current.approved + 1 : current.approved,
          rejected: action === "REJECT" ? current.rejected + 1 : current.rejected
        };
        const totalReviewed = nextStats.approved + nextStats.flagged + nextStats.rejected;
        nextStats.flaggedRatio = totalReviewed > 0 ? nextStats.flagged / totalReviewed : 0;
        return nextStats;
      });
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Moderator queue"
        title="Review content the AI was uncertain about."
        description="Anything that crosses the review thresholds remains intact and visible here with scores and reasons so a human can make the final call."
      />

      {stats ? (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">Approved</p>
            <p className="mt-2 text-3xl font-bold text-ink">{stats.approved}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">Flagged</p>
            <p className="mt-2 text-3xl font-bold text-warning">{stats.flagged}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">Rejected</p>
            <p className="mt-2 text-3xl font-bold text-danger">{stats.rejected}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">Flagged ratio</p>
            <p className="mt-2 text-3xl font-bold text-ink">{(stats.flaggedRatio * 100).toFixed(1)}%</p>
          </div>
        </div>
      ) : null}

      {loading ? <p className="text-sm text-slate-500">Loading flagged posts...</p> : null}

      {!loading && posts.length === 0 ? (
        <div className="rounded-[28px] bg-white p-8 text-sm text-slate-500 shadow-card">
          No flagged posts right now. The queue is clear.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            showModeration
            onResolve={handleResolve}
            busyAction={busyAction === post._id}
          />
        ))}
      </div>
    </div>
  );
}
