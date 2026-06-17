"use client";

import { type FormEvent, useState } from "react";

import { Spinner } from "@/components/Spinner";
import type { ConversationSummary } from "@/lib/messages";
import { formatMessageTime } from "@/lib/messages";

import { useMessageThread } from "./useMessageThread";

type MessageThreadProps = {
  conversation: ConversationSummary | null;
};

export function MessageThread({ conversation }: MessageThreadProps) {
  const [draft, setDraft] = useState("");
  const { messages, loading, sending, error, sendMessage, bottomRef } =
    useMessageThread(conversation?.id ?? null);

  if (!conversation) {
    return (
      <div className="flex h-full min-h-80 items-center justify-center rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
        Select a conversation to start chatting.
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      return;
    }

    const sent = await sendMessage(text);
    if (sent) {
      setDraft("");
    }
  }

  return (
    <div className="flex min-h-80 flex-col rounded-lg border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              conversation.otherUser?.online ? "bg-emerald-500" : "bg-zinc-300"
            }`}
          />
          <h2 className="font-medium text-zinc-900">
            {conversation.otherUser?.name ?? "Unknown"}
          </h2>
          <span className="text-xs text-zinc-500">
            {conversation.otherUser?.online ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {error ? (
        <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center gap-2 text-zinc-600">
            <Spinner label="Loading messages" />
            <span className="text-sm">Loading messages…</span>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-zinc-500">No messages yet. Say hello.</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  message.isOwn
                    ? "bg-sky-600 text-white"
                    : "bg-zinc-100 text-zinc-900"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                <p
                  className={`mt-1 text-[11px] ${
                    message.isOwn ? "text-sky-100" : "text-zinc-500"
                  }`}
                >
                  {formatMessageTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="border-t border-zinc-200 p-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a message…"
            maxLength={4000}
            disabled={sending}
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
