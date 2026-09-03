"use client";

import { useState } from "react";

import type { ProfileUser } from "@/lib/profile";
import {
  formatEmailVerified,
  formatMemberSince,
  profileRoleLabel,
} from "@/lib/profile";

import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileForm } from "./ProfileForm";
import { ProfileImageSection } from "./ProfileImageSection";
import { ProfileLogoutSection } from "./ProfileLogoutSection";
import { ProfilePasswordSection } from "./ProfilePasswordSection";

function roleBadgeClass(role: string): string {
  switch (role) {
    case "SUPERADMIN":
      return "bg-violet-100 text-violet-900";
    case "ADMIN":
      return "bg-sky-100 text-sky-900";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

type ProfileCardProps = {
  user: ProfileUser;
  onUpdated: (user: ProfileUser) => void;
};

export function ProfileCard({ user, onUpdated }: ProfileCardProps) {
  const [imageCacheKey, setImageCacheKey] = useState(0);

  function handleImageUpdated(updated: ProfileUser) {
    setImageCacheKey(Date.now());
    onUpdated(updated);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-6 py-6">
        <div className="flex flex-wrap items-center gap-4">
          <ProfileAvatar
            user={user}
            imageCacheKey={imageCacheKey}
          />
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">{user.name}</h2>
            <p className="mt-1 text-sm text-zinc-600">{user.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass(user.role)}`}
              >
                {profileRoleLabel(user.role)}
              </span>
              <span className="text-xs text-zinc-500">
                Member since {formatMemberSince(user.createdAt)}
              </span>
              <span className="text-xs text-zinc-500">
                Email verified {formatEmailVerified(user.emailVerified)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <ProfileForm user={user} onUpdated={onUpdated} />
      </div>
      <ProfileImageSection
        user={user}
        onUpdated={handleImageUpdated}
        imageCacheKey={imageCacheKey}
      />
      <ProfilePasswordSection />
      <ProfileLogoutSection />
    </div>
  );
}
