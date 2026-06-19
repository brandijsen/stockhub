"use client";

import { type ChangeEvent, useRef, useState } from "react";

import {
  removeProfileImage,
  uploadProfileImage,
  type ProfileUser,
} from "@/lib/profile";
import { apiErrorMessage } from "@/lib/api-client";

import { ProfileAvatar } from "./ProfileAvatar";

type ProfileImageSectionProps = {
  user: ProfileUser;
  onUpdated: (user: ProfileUser) => void;
  imageCacheKey: number;
};

export function ProfileImageSection({
  user,
  onUpdated,
  imageCacheKey,
}: ProfileImageSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = uploading || removing;
  const hasStoredImage = user.imageUrl !== null;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const updated = await uploadProfileImage(file);
      onUpdated(updated);
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to upload profile photo"));
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (!hasStoredImage || busy) {
      return;
    }

    setRemoving(true);
    setError(null);
    try {
      const updated = await removeProfileImage();
      onUpdated(updated);
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to remove profile photo"));
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="border-t border-zinc-200 px-6 py-6">
      <h3 className="text-sm font-medium text-zinc-900">Profile photo</h3>
      <p className="mt-1 text-xs text-zinc-500">
        JPEG, PNG or WebP — max 5 MB.
      </p>

      <div className="mt-4 flex flex-wrap items-start gap-4">
        <ProfileAvatar user={user} size="md" imageCacheKey={imageCacheKey} />
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(event) => void handleFileChange(event)}
            className="hidden"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Choose photo"}
          </button>
          {hasStoredImage ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleRemove()}
              className="text-left text-sm text-red-700 underline hover:text-red-900 disabled:opacity-50"
            >
              {removing ? "Removing…" : "Remove photo"}
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}
