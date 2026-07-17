"use client";

import axios from "axios";
import { useState } from "react";

import { Spinner } from "@/components/Spinner";

type LogoutButtonProps = {
  variant?: "primary" | "outline";
};

export function LogoutButton({ variant = "primary" }: LogoutButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setBusy(true);
    setError(null);
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      window.location.assign("/");
    } catch {
      setError("Could not sign out. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={busy}
        aria-busy={busy}
        onClick={handleLogout}
        className={
          variant === "outline"
            ? "inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
            : "inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        }
      >
        {busy ? (
          <Spinner
            className={
              variant === "outline" ? "h-4 w-4 text-zinc-800" : "h-4 w-4 text-white"
            }
          />
        ) : null}
        {busy ? "Signing out…" : "Log out"}
      </button>
    </div>
  );
}
