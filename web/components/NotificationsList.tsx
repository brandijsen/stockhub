"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Spinner } from "@/components/Spinner";
import { LoadingText } from "@/components/ContentSkeletons";
import { apiErrorMessage } from "@/lib/api-client";
import {
  fetchNotifications,
  formatNotificationTime,
  markNotificationRead,
  notificationHref,
  notifyNotificationsChanged,
  notificationTypeBadgeClass,
  notificationTypeLabel,
  type Notification,
} from "@/lib/notifications";

const POLL_INTERVAL_MS = 30_000;

function mergeFirstPage(
  current: Notification[],
  fresh: Notification[],
): { items: Notification[]; replaceCursor: boolean } {
  const freshIds = new Set(fresh.map((item) => item.id));
  const coversCurrent = current.every((item) => freshIds.has(item.id));
  if (coversCurrent) {
    return { items: fresh, replaceCursor: true };
  }
  const older = current.filter((item) => !freshIds.has(item.id));
  return { items: [...fresh, ...older], replaceCursor: false };
}

export function NotificationsList() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const loadingMoreRef = useRef(false);
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  const load = useCallback(async (silent = false) => {
    if (silent && loadingMoreRef.current) {
      return;
    }
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const { notifications: list, nextCursor: cursor } =
        await fetchNotifications();
      if (silent && loadingMoreRef.current) {
        return;
      }
      if (silent) {
        setNotifications((current) => {
          const merged = mergeFirstPage(current, list);
          notificationsRef.current = merged.items;
          if (merged.replaceCursor) {
            setNextCursor(cursor);
          }
          return merged.items;
        });
      } else {
        notificationsRef.current = list;
        setNotifications(list);
        setNextCursor(cursor);
      }
      if (silent) {
        setError(null);
      }
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to load notifications"));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError(null);
    try {
      const { notifications: list, nextCursor: cursor } =
        await fetchNotifications(nextCursor);
      setNotifications((current) => {
        const next = [...current, ...list];
        notificationsRef.current = next;
        return next;
      });
      setNextCursor(cursor);
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to load more notifications"));
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore]);

  useEffect(() => {
    void load();
    const intervalId = window.setInterval(
      () => void load(true),
      POLL_INTERVAL_MS,
    );
    return () => window.clearInterval(intervalId);
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
      notifyNotificationsChanged();
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to mark notification as read"));
    } finally {
      setMarkingId(null);
    }
  }

  async function handleOpen(notification: Notification, href: string) {
    if (notification.readAt) {
      router.push(href);
      return;
    }
    setOpeningId(notification.id);
    try {
      await markNotificationRead(notification.id);
      notifyNotificationsChanged();
      router.push(href);
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to mark notification as read"));
      setOpeningId(null);
    }
  }

  const showInitialLoading = loading && notifications.length === 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Notifications</h1>
      <p className="mt-1 text-zinc-600">
        Team alerts for warehouse events. Opening one marks it as read.
      </p>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {showInitialLoading ? (
        <LoadingText />
      ) : notifications.length === 0 ? (
        <p className="mt-8 text-zinc-600">No notifications yet.</p>
      ) : (
        <>
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-zinc-900">
                          {notification.title ?? "Notification"}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${notificationTypeBadgeClass(notification.type)}`}
                        >
                          {notificationTypeLabel(notification.type)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-700">
                        {notification.body}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        {formatNotificationTime(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {href ? (
                        <Link
                          href={href}
                          onClick={(event) => {
                            event.preventDefault();
                            if (
                              openingId === notification.id ||
                              markingId === notification.id
                            ) {
                              return;
                            }
                            void handleOpen(notification, href);
                          }}
                          className="text-sm font-medium text-sky-700 hover:text-sky-900"
                        >
                          {openingId === notification.id ? "Opening…" : "Open"}
                        </Link>
                      ) : null}
                      {unread ? (
                        <button
                          type="button"
                          disabled={
                            markingId === notification.id ||
                            openingId === notification.id
                          }
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

          {nextCursor ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={loadingMore}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingMore ? (
                  <Spinner className="h-4 w-4" label="Loading older notifications" />
                ) : (
                  "Load older notifications"
                )}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
