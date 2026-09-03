import { api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format-dates";

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
  nextCursor: string | null;
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
  return formatDateTime(iso);
}

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  STOCK_ADJUSTMENT: "Stock",
  SUPPLIER_ORDER_ARRIVED: "Supplier order",
};

export function notificationTypeLabel(type: string): string {
  return NOTIFICATION_TYPE_LABELS[type] ?? "System";
}

export function notificationTypeBadgeClass(type: string): string {
  switch (type) {
    case "STOCK_ADJUSTMENT":
      return "bg-amber-100 text-amber-900";
    case "SUPPLIER_ORDER_ARRIVED":
      return "bg-sky-100 text-sky-900";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

export async function fetchNotifications(
  cursor?: string,
): Promise<NotificationsListResponse> {
  const { data } = await api.get<NotificationsListResponse>(
    "/api/notifications",
    { params: cursor ? { cursor } : undefined },
  );
  return data;
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
