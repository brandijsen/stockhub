"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Spinner } from "@/components/Spinner";
import { apiErrorMessage } from "@/lib/api-client";
import {
  fetchNotifications,
  formatNotificationTime,
  markNotificationRead,
  notificationHref,
  type Notification,
} from "@/lib/notifications";

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchNotifications();
      setNotifications(list);
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to load notifications"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleMarkRead(notification: Notification) {
    if (notification.readAt) {
      return;
    }
    setMarkingId(notification.id);
    try {
      const updated = await markNotificationRead(notification.id);
      setNotifications((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to mark notification as read"));
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Notifications</h1>
          <p className="mt-1 text-zinc-600">
            Team alerts for warehouse events. Unread items stay highlighted.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-zinc-600">
          <Spinner label="Loading notifications" />
          <span>Loading notifications…</span>
        </div>
      ) : notifications.length === 0 ? (
        <p className="mt-8 text-zinc-600">No notifications yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {notifications.map((notification) => {
            const href = notificationHref(notification);
            const unread = notification.readAt == null;

            return (
              <li
                key={notification.id}
                className={`rounded-lg border px-4 py-3 ${
                  unread
                    ? "border-sky-200 bg-sky-50/60"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-zinc-900">
                      {notification.title ?? "Notification"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-700">
                      {notification.body}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {href ? (
                      <Link
                        href={href}
                        className="text-sm font-medium text-sky-700 hover:text-sky-900"
                      >
                        Open
                      </Link>
                    ) : null}
                    {unread ? (
                      <button
                        type="button"
                        disabled={markingId === notification.id}
                        onClick={() => void handleMarkRead(notification)}
                        className="text-sm font-medium text-zinc-700 hover:text-zinc-900 disabled:opacity-50"
                      >
                        {markingId === notification.id ? "Marking…" : "Mark read"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
