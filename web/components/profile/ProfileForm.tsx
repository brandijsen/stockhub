"use client";

import { type FormEvent, useEffect, useState } from "react";

import { articleFormInputClass } from "@/components/article-form/input-styles";
import type { ProfileUser } from "@/lib/profile";
import { profileRoleLabel, updateProfile } from "@/lib/profile";
import { apiErrorMessage } from "@/lib/api-client";

type ProfileFormProps = {
  user: ProfileUser;
  onUpdated: (user: ProfileUser) => void;
};

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-600">{label}</label>
      <p className="mt-1 text-sm text-zinc-900">{value}</p>
    </div>
  );
}

export function ProfileForm({ user, onUpdated }: ProfileFormProps) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
  }, [user.firstName, user.lastName]);

  const hasChanges =
    firstName.trim() !== user.firstName || lastName.trim() !== user.lastName;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!hasChanges || saving) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      onUpdated(updated);
      setSuccess("Profile updated.");
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-first-name" className="block text-sm font-medium text-zinc-600">
            First name
          </label>
          <input
            id="profile-first-name"
            type="text"
            value={firstName}
            maxLength={80}
            disabled={saving}
            onChange={(event) => setFirstName(event.target.value)}
            className={`mt-1 ${articleFormInputClass}`}
          />
        </div>
        <div>
          <label htmlFor="profile-last-name" className="block text-sm font-medium text-zinc-600">
            Last name
          </label>
          <input
            id="profile-last-name"
            type="text"
            value={lastName}
            maxLength={80}
            disabled={saving}
            onChange={(event) => setLastName(event.target.value)}
            className={`mt-1 ${articleFormInputClass}`}
          />
        </div>
        <ReadOnlyField label="Email" value={user.email} />
        <ReadOnlyField label="Role" value={profileRoleLabel(user.role)} />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!hasChanges || saving}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
