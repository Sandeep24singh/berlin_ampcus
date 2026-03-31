import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { AuthPanel } from "../components/AuthPanel";
import { SectionHeader } from "../components/SectionHeader";

export function AuthPage() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(payload) {
    try {
      setBusy(true);
      setError("");
      if (mode === "login") {
        const result = await auth.signIn(payload);
        navigate(result.user.role === "MODERATOR" ? "/moderation" : "/create");
      } else {
        const result = await auth.signUp(payload);
        navigate(result.user.role === "MODERATOR" ? "/moderation" : "/create");
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to authenticate.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <SectionHeader
        eyebrow="Access"
        title="A shared workspace for users and moderators."
        description="Create accounts, publish content into the moderation pipeline, and move flagged posts through a safe human review workflow."
      />

      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === "login" ? "bg-ink text-white" : "bg-white text-slate-600"}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === "register" ? "bg-ink text-white" : "bg-white text-slate-600"}`}
          >
            Register
          </button>
        </div>

        {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-danger">{error}</div> : null}

        <AuthPanel mode={mode} onSubmit={handleSubmit} busy={busy} />
      </div>
    </div>
  );
}
