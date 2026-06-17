import { api } from "@/lib/api-client";

export type MessageUser = {
  id: string;
  name: string;
  online: boolean;
};

export type ConversationSummary = {
  id: string;
  updatedAt: string;
  otherUser: MessageUser | null;
  lastMessage: {
    id: string;
    body: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  sender: MessageUser;
  isOwn: boolean;
};

export type ConversationsListResponse = {
  conversations: ConversationSummary[];
};

export type CreateConversationResponse = {
  conversation: ConversationSummary;
};

export type MessagesListResponse = {
  messages: ChatMessage[];
  nextCursor: string | null;
};

export type SendMessageResponse = {
  message: ChatMessage;
};

export type UnreadCountResponse = {
  total: number;
};

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const { data } = await api.get<ConversationsListResponse>("/api/conversations");
  return data.conversations;
}

export async function startConversation(
  withUserId: string,
): Promise<ConversationSummary> {
  const { data } = await api.post<CreateConversationResponse>(
    "/api/conversations",
    { withUserId },
  );
  return data.conversation;
}

export async function fetchMessages(
  conversationId: string,
  cursor?: string,
): Promise<MessagesListResponse> {
  const { data } = await api.get<MessagesListResponse>(
    `/api/conversations/${conversationId}/messages`,
    { params: cursor ? { cursor } : undefined },
  );
  return data;
}

export async function sendChatMessage(
  conversationId: string,
  body: string,
): Promise<ChatMessage> {
  const { data } = await api.post<SendMessageResponse>(
    `/api/conversations/${conversationId}/messages`,
    { body },
  );
  return data.message;
}

export async function markConversationRead(conversationId: string): Promise<void> {
  await api.post(`/api/conversations/${conversationId}/read`);
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await api.get<UnreadCountResponse>(
    "/api/conversations/unread-count",
  );
  return data.total;
}

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
