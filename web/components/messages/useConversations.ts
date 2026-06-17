"use client";

import { useCallback, useEffect, useState } from "react";

import {
  type ConversationSummary,
  fetchConversations,
  startConversation,
} from "@/lib/messages";
import { apiErrorMessage } from "@/lib/api-client";

const POLL_INTERVAL_MS = 30_000;

export function useConversations(initialWithUserId?: string) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const list = await fetchConversations();
      setConversations(list);
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to load conversations"));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  const openWithUser = useCallback(async (withUserId: string) => {
    setError(null);
    try {
      const conversation = await startConversation(withUserId);
      setConversations((current) => {
        const without = current.filter((c) => c.id !== conversation.id);
        return [conversation, ...without];
      });
      setSelectedId(conversation.id);
      return conversation.id;
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to start conversation"));
      return null;
    }
  }, []);

  useEffect(() => {
    void loadConversations();
    const intervalId = window.setInterval(
      () => void loadConversations(true),
      POLL_INTERVAL_MS,
    );
    return () => window.clearInterval(intervalId);
  }, [loadConversations]);

  useEffect(() => {
    if (!initialWithUserId) {
      return;
    }
    void openWithUser(initialWithUserId);
  }, [initialWithUserId, openWithUser]);

  const upsertConversation = useCallback((conversation: ConversationSummary) => {
    setConversations((current) => {
      const without = current.filter((c) => c.id !== conversation.id);
      return [conversation, ...without].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    });
  }, []);

  return {
    conversations,
    selectedId,
    setSelectedId,
    loading,
    error,
    loadConversations,
    openWithUser,
    upsertConversation,
  };
}
