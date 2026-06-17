"use client";

import { useMemo } from "react";

import { Spinner } from "@/components/Spinner";

import { MessageThread } from "./MessageThread";
import { MessagesInbox } from "./MessagesInbox";
import { useConversations } from "./useConversations";

type MessagesViewProps = {
  withUserId?: string;
};

export function MessagesView({ withUserId }: MessagesViewProps) {
  const {
    conversations,
    selectedId,
    setSelectedId,
    loading,
    error,
    loadConversations,
  } = useConversations(withUserId);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Messages</h1>
          <p className="mt-1 text-zinc-600">
            Direct messages with your team.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadConversations(true)}
          disabled={loading}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading && conversations.length === 0 ? (
        <div className="mt-8 flex items-center gap-2 text-zinc-600">
          <Spinner label="Loading conversations" />
          <span>Loading conversations…</span>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <MessagesInbox
              conversations={conversations}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          <div className="lg:col-span-2">
            <MessageThread conversation={selectedConversation} />
          </div>
        </div>
      )}
    </div>
  );
}
