import type { Notification } from "@prisma/client";

export type SerializedNotification = {
  id: string;
  type: string;
  title: string | null;
  body: string;
  readAt: string | null;
  supplierOrderId: string | null;
  articleId: string | null;
  createdAt: string;
};

export function serializeNotification(
  notification: Notification,
): SerializedNotification {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    readAt: notification.readAt?.toISOString() ?? null,
    supplierOrderId: notification.supplierOrderId,
    articleId: notification.articleId,
    createdAt: notification.createdAt.toISOString(),
  };
}
