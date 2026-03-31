import { useState } from "react";

export function AuthPanel({ mode, onSubmit, busy }) {
  const [formState, setFormState] = useState({
    username: "",
    password: "",
    role: "USER"
  });

  return (
    <form
      className="space-y-4 rounded-3xl bg-white p-6 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(formState);
      }}
    >
      <div>
        <h2 className="text-2xl font-bold text-ink">{mode === "login" ? "Sign in" : "Create account"}</h2>
        <p className="mt-2 text-sm text-slate-500">
          {mode === "login"
            ? "Access your posting or moderation dashboard."
            : "Create a user or moderator account for the demo environment."}
        </p>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Username</span>
        <input
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-accent"
          value={formState.username}
          onChange={(event) => setFormState((current) => ({ ...current, username: event.target.value }))}
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
        <input
          type="password"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-accent"
          value={formState.password}
          onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
          required
        />
      </label>

      {mode === "register" ? (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Role</span>
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-accent"
            value={formState.role}
            onChange={(event) => setFormState((current) => ({ ...current, role: event.target.value }))}
          >
            <option value="USER">User</option>
            <option value="MODERATOR">Moderator</option>
          </select>
        </label>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-2xl bg-ink px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
