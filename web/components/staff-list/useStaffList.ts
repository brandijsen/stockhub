"use client";

import { useCallback, useEffect, useState } from "react";

import { type StaffListResponse } from "@/lib/staff";
import { api, apiErrorMessage } from "@/lib/api-client";

const POLL_INTERVAL_MS = 60_000;

export function useStaffList() {
  const [users, setUsers] = useState<StaffListResponse["users"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const { data } = await api.get<StaffListResponse>("/api/staff");
      setUsers(data.users);
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to load staff"));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadStaff();
    const intervalId = window.setInterval(
      () => void loadStaff({ silent: true }),
      POLL_INTERVAL_MS,
    );
    return () => window.clearInterval(intervalId);
  }, [loadStaff]);

  return {
    users,
    loading,
    error,
    replaceUser: (updated: StaffListResponse["users"][number]) => {
      setUsers((current) =>
        current.map((user) => (user.id === updated.id ? updated : user)),
      );
    },
  };
}
