"use client";

import { useCallback, useEffect, useState } from "react";

import { apiErrorMessage } from "@/lib/api-client";

type PartyRecord = {
  id: string;
  name: string;
};

export function usePartyList<T extends PartyRecord>(
  loadItems: () => Promise<T[]>,
  loadErrorMessage: string,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const list = await loadItems();
        setItems(list);
      } catch (e) {
        setError(apiErrorMessage(e, loadErrorMessage));
      } finally {
        if (silent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [loadErrorMessage, loadItems],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return {
    items,
    loading,
    refreshing,
    error,
    refresh: () => load({ silent: true }),
    replaceItem: (updated: T) => {
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    },
    removeItem: (id: string) => {
      setItems((current) => current.filter((item) => item.id !== id));
    },
    prependItem: (item: T) => {
      setItems((current) =>
        [...current, item].sort((a, b) => a.name.localeCompare(b.name)),
      );
    },
  };
}
