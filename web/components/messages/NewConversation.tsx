"use client";

import { useEffect, useState } from "react";

import { articleFormInputClass } from "@/components/article-form/input-styles";
import { api, apiErrorMessage } from "@/lib/api-client";
import type { StaffListResponse } from "@/lib/staff";

type NewConversationProps = {
  existingUserIds: string[];
  onStart: (userId: string) => Promise<string | null>;
};

export function NewConversation({
  existingUserIds,
  onStart,
}: NewConversationProps) {
  const [candidates, setCandidates] = useState<
    { id: string; name: string }[]
  >([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [staff, me] = await Promise.all([
          api.get<StaffListResponse>("/api/staff"),
          api.get<{ user: { id: string } }>("/api/auth/me"),
        ]);
        if (cancelled) {
          return;
        }
        const taken = new Set(existingUserIds);
        const next = staff.data.users
          .filter((user) => user.id !== me.data.user.id && !taken.has(user.id))
          .map((user) => ({ id: user.id, name: user.name }));
        setCandidates(next);
        setUserId((current) =>
          next.some((user) => user.id === current) ? current : "",
        );
      } catch (e) {
        if (!cancelled) {
          setError(apiErrorMessage(e, "Failed to load team members"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [existingUserIds.join("\n")]);

  async function handleStart() {
    if (!userId || starting) {
      return;
    }
    setStarting(true);
    setError(null);
    await onStart(userId);
    setStarting(false);
    setUserId("");
  }

  if (loading) {
    return null;
  }

  if (candidates.length === 0 && !error) {
    return null;
  }

  return (
    <div className="mb-3 rounded-lg border border-zinc-200 bg-white p-3">
      <p className="text-sm font-medium text-zinc-900">New conversation</p>
      {error ? (
        <p className="mt-2 text-sm text-red-800">{error}</p>
      ) : null}
      {candidates.length > 0 ? (
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="new-conversation-user">
            Team member
          </label>
          <select
            id="new-conversation-user"
            value={userId}
            disabled={starting}
            onChange={(event) => setUserId(event.target.value)}
            className={articleFormInputClass}
          >
            <option value="">Select a team member</option>
            {candidates.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!userId || starting}
            onClick={() => void handleStart()}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {starting ? "Starting…" : "Start"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
