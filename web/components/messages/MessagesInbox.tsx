import type { ConversationSummary } from "@/lib/messages";
import { formatMessageTime } from "@/lib/messages";

type MessagesInboxProps = {
  conversations: ConversationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function statusDotClass(online: boolean): string {
  return online ? "bg-emerald-500" : "bg-zinc-300";
}

export function MessagesInbox({
  conversations,
  selectedId,
  onSelect,
}: MessagesInboxProps) {
  if (conversations.length === 0) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
        No conversations yet. Start one from the Staff page.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <ul className="divide-y divide-zinc-100">
        {conversations.map((conversation) => {
          const selected = conversation.id === selectedId;
          const preview = conversation.lastMessage?.body ?? "No messages yet";
          const time = conversation.lastMessage
            ? formatMessageTime(conversation.lastMessage.createdAt)
            : formatMessageTime(conversation.updatedAt);

          return (
            <li key={conversation.id}>
              <button
                type="button"
                onClick={() => onSelect(conversation.id)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-zinc-50 ${
                  selected ? "bg-sky-50 hover:bg-sky-50" : ""
                }`}
              >
                <span
                  className={`mt-2 h-2 w-2 shrink-0 rounded-full ${statusDotClass(
                    conversation.otherUser?.online ?? false,
                  )}`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-zinc-900">
                      {conversation.otherUser?.name ?? "Unknown"}
                    </span>
                    <span className="shrink-0 text-xs text-zinc-500">{time}</span>
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-zinc-600">
                      {preview}
                    </span>
                    {conversation.unreadCount > 0 ? (
                      <span className="shrink-0 rounded-full bg-sky-600 px-2 py-0.5 text-xs font-medium text-white">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
