"use client";

import { LoadingText } from "@/components/ContentSkeletons";

import { ProfileCard } from "./ProfileCard";
import { useProfile } from "./useProfile";

export function ProfileView() {
  const { user, loading, error, setUser } = useProfile();

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Profile</h1>
        <p className="mt-1 text-zinc-600">
          Update your name and review your account details.
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading && !user ? (
        <LoadingText className="mt-8 max-w-2xl" />
      ) : user ? (
        <div className="mt-6 max-w-2xl">
          <ProfileCard user={user} onUpdated={setUser} />
        </div>
      ) : null}
    </div>
  );
}
