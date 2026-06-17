"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  type ChatMessage,
  fetchMessages,
  markConversationRead,
  sendChatMessage,
} from "@/lib/messages";
import { apiErrorMessage } from "@/lib/api-client";

const POLL_INTERVAL_MS = 10_000;

export function useMessageThread(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadMessages = useCallback(
    async (silent = false) => {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      if (!silent) {
        setLoading(true);
      }
      setError(null);
      try {
        const { messages: page } = await fetchMessages(conversationId);
        setMessages(page);
        await markConversationRead(conversationId);
      } catch (e) {
        setError(apiErrorMessage(e, "Failed to load messages"));
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [conversationId],
  );

  useEffect(() => {
    void loadMessages();
    if (!conversationId) {
      return;
    }

    const intervalId = window.setInterval(
      () => void loadMessages(true),
      POLL_INTERVAL_MS,
    );
    return () => window.clearInterval(intervalId);
  }, [conversationId, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
    loading,
    sending,
    error,
    sendMessage,
    bottomRef,
  };
}
