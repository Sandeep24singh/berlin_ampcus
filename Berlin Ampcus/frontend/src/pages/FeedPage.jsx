import { useEffect, useState } from "react";
import { fetchApprovedPosts } from "../api/posts";
import { PostCard } from "../components/PostCard";
import { SectionHeader } from "../components/SectionHeader";

export function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchApprovedPosts()
      .then((result) => {
        if (active) {
          setPosts(result);
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

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Approved feed"
        title="Only content that cleared moderation appears here."
        description="The public feed excludes pending, flagged, and rejected content so moderation remains asynchronous without exposing unsafe material."
      />

      {loading ? <p className="text-sm text-slate-500">Loading approved posts...</p> : null}

      {!loading && posts.length === 0 ? (
        <div className="rounded-[28px] bg-white p-8 text-sm text-slate-500 shadow-card">
          No approved posts yet. Submit a post and let the worker process it.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}
