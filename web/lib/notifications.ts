import { api } from "@/lib/api-client";

export type Notification = {
  id: string;
  type: string;
  title: string | null;
  body: string;
  readAt: string | null;
  supplierOrderId: string | null;
  articleId: string | null;
  createdAt: string;
};

export type NotificationsListResponse = {
  notifications: Notification[];
};

export type UnreadNotificationsCountResponse = {
  total: number;
};

export function notificationHref(notification: Notification): string | null {
  if (notification.supplierOrderId) {
    return `/supplier-orders/${notification.supplierOrderId}`;
  }
  if (notification.articleId) {
    return `/articles/${notification.articleId}`;
  }
  return null;
}

export function formatNotificationTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await api.get<NotificationsListResponse>("/api/notifications");
  return data.notifications;
}

export async function fetchUnreadNotificationsCount(): Promise<number> {
  const { data } = await api.get<UnreadNotificationsCountResponse>(
    "/api/notifications/unread-count",
  );
  return data.total;
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const { data } = await api.patch<{ notification: Notification }>(
    `/api/notifications/${id}/read`,
  );
  return data.notification;
}
