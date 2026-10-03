"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

const POLL_INTERVAL_MS = 30_000;

type UnreadNavLinkProps = {
  href: string;
  label: string;
  fetchCount: () => Promise<number>;
  icon: ReactNode;
  refreshEvent?: string;
};

export function UnreadNavLink({
  href,
  label,
  fetchCount,
  icon,
  refreshEvent,
}: UnreadNavLinkProps) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const total = await fetchCount();
        if (!cancelled) {
          setUnread(total);
        }
      } catch {
        /* ignore */
      }
    }
    void load();
    const intervalId = window.setInterval(() => void load(), POLL_INTERVAL_MS);
    if (refreshEvent) {
      window.addEventListener(refreshEvent, load);
    }
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      if (refreshEvent) {
        window.removeEventListener(refreshEvent, load);
      }
    };
  }, [fetchCount, refreshEvent]);

  return (
    <Link
      href={href}
      aria-label={unread > 0 ? `${label}, ${unread} unread` : label}
      title={label}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    >
      {icon}
      {unread > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
