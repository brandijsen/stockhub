"use client";

import { type FormEvent, useState } from "react";

import { articleFormInputClass } from "@/components/article-form/input-styles";
import { apiErrorMessage } from "@/lib/api-client";
import { changeProfilePassword } from "@/lib/profile";

export function ProfilePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    confirmNewPassword.length > 0 &&
    !saving;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await changeProfilePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSuccess("Password updated.");
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to change password"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-t border-zinc-200 px-6 py-6">
      <h3 className="text-sm font-medium text-zinc-900">Password</h3>
      <p className="mt-1 text-xs text-zinc-500">
        Use at least 8 characters. You stay signed in after changing it.
      </p>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="mt-4 space-y-4"
      >
        <div>
          <label
            htmlFor="profile-current-password"
            className="block text-sm font-medium text-zinc-600"
          >
            Current password
          </label>
          <input
            id="profile-current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            disabled={saving}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className={`mt-1 ${articleFormInputClass}`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profile-new-password"
              className="block text-sm font-medium text-zinc-600"
            >
              New password
            </label>
            <input
              id="profile-new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              minLength={8}
              disabled={saving}
              onChange={(event) => setNewPassword(event.target.value)}
              className={`mt-1 ${articleFormInputClass}`}
            />
          </div>
          <div>
            <label
              htmlFor="profile-confirm-password"
              className="block text-sm font-medium text-zinc-600"
            >
              Confirm new password
            </label>
            <input
              id="profile-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmNewPassword}
              minLength={8}
              disabled={saving}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              className={`mt-1 ${articleFormInputClass}`}
            />
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
