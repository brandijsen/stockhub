"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  type ChatMessage,
  fetchMessages,
  markConversationRead,
  sendChatMessage,
} from "@/lib/messages";
import { apiErrorMessage } from "@/lib/api-client";

const POLL_INTERVAL_MS = 10_000;
const NEAR_BOTTOM_THRESHOLD_PX = 80;

export function useMessageThread(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const shouldScrollToBottomRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }, []);

  const updateNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    isNearBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      NEAR_BOTTOM_THRESHOLD_PX;
  }, []);

  const loadMessages = useCallback(
    async (silent = false) => {
      if (!conversationId) {
        return;
      }

      if (!silent) {
        setReady(false);
      }
      setError(null);
      try {
        const { messages: page, nextCursor: cursor } =
          await fetchMessages(conversationId);

        if (silent) {
          setMessages((current) => {
            const existingIds = new Set(current.map((message) => message.id));
            const newMessages = page.filter(
              (message) => !existingIds.has(message.id),
            );
            if (newMessages.length === 0) {
              return current;
            }
            if (isNearBottomRef.current) {
              shouldScrollToBottomRef.current = true;
            }
            return [...current, ...newMessages];
          });
        } else {
          setMessages(page);
          setNextCursor(cursor);
          shouldScrollToBottomRef.current = true;
          setReady(true);
        }

        await markConversationRead(conversationId);
      } catch (e) {
        setError(apiErrorMessage(e, "Failed to load messages"));
        if (!silent) {
          setReady(true);
        }
      }
    },
    [conversationId],
  );

  const loadOlderMessages = useCallback(async () => {
    if (!conversationId || !nextCursor || loadingOlder) {
      return;
    }

    const container = scrollContainerRef.current;
    const previousScrollHeight = container?.scrollHeight ?? 0;

    setLoadingOlder(true);
    setError(null);
    try {
      const { messages: older, nextCursor: cursor } = await fetchMessages(
        conversationId,
        nextCursor,
      );
      setMessages((current) => [...older, ...current]);
      setNextCursor(cursor);

      requestAnimationFrame(() => {
        if (!container) {
          return;
        }
        container.scrollTop += container.scrollHeight - previousScrollHeight;
        updateNearBottom();
      });
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to load older messages"));
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, nextCursor, loadingOlder, updateNearBottom]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    isNearBottomRef.current = true;
    void loadMessages();

    const intervalId = window.setInterval(
      () => void loadMessages(true),
      POLL_INTERVAL_MS,
    );
    return () => window.clearInterval(intervalId);
  }, [conversationId, loadMessages]);

  useLayoutEffect(() => {
    if (loadingOlder) {
      return;
    }
    if (shouldScrollToBottomRef.current) {
      scrollToBottom();
      shouldScrollToBottomRef.current = false;
    }
  }, [messages, loadingOlder, scrollToBottom]);

  const sendMessage = useCallback(
    async (body: string) => {
      if (!conversationId || !body.trim()) {
        return false;
      }

      setSending(true);
      setError(null);
      try {
        const message = await sendChatMessage(conversationId, body.trim());
        setMessages((current) => [...current, message]);
        shouldScrollToBottomRef.current = true;
        await markConversationRead(conversationId);
        return true;
      } catch (e) {
        setError(apiErrorMessage(e, "Failed to send message"));
        return false;
      } finally {
        setSending(false);
      }
    },
    [conversationId],
  );

  return {
    messages,
    ready,
    loadingOlder,
    hasOlderMessages: nextCursor != null,
    sending,
    error,
    sendMessage,
    loadOlderMessages,
    bottomRef,
    scrollContainerRef,
    onScroll: updateNearBottom,
  };
}
