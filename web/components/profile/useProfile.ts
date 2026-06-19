"use client";

import { useCallback, useEffect, useState } from "react";

import { type ProfileUser, fetchProfile } from "@/lib/profile";
import { apiErrorMessage } from "@/lib/api-client";

export function useProfile() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUser(await fetchProfile());
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to load profile"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return { user, loading, error, reload: loadProfile, setUser };
}
