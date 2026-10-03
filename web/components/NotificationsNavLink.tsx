"use client";

import { UnreadNavLink } from "@/components/UnreadNavLink";
import {
  fetchUnreadNotificationsCount,
  NOTIFICATIONS_CHANGED_EVENT,
} from "@/lib/notifications";

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
    </svg>
  );
}

export function NotificationsNavLink() {
  return (
    <UnreadNavLink
      href="/notifications"
      label="Notifications"
      fetchCount={fetchUnreadNotificationsCount}
      icon={<BellIcon className="h-5 w-5" />}
      refreshEvent={NOTIFICATIONS_CHANGED_EVENT}
    />
  );
}
