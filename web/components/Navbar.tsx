"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { MessagesNavLink } from "@/components/MessagesNavLink";
import { NotificationsNavLink } from "@/components/NotificationsNavLink";
import { ProfileNavLink } from "@/components/ProfileNavLink";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/articles", label: "Articles" },
  { href: "/customers", label: "Customers" },
  { href: "/customer-orders", label: "Customer orders" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/supplier-orders", label: "Supplier orders" },
  { href: "/staff", label: "Staff" },
] as const;

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function navLinkClass(active: boolean, mobile = false): string {
  const base = mobile
    ? "block px-4 py-3 text-base font-medium"
    : "text-sm";
  if (active) {
    return mobile
      ? `${base} bg-zinc-100 text-zinc-900`
      : `${base} font-medium text-zinc-900`;
  }
  return mobile
    ? `${base} text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900`
    : `${base} text-zinc-700 hover:text-zinc-900`;
}

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function isActive(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="relative z-50 w-full overflow-x-clip border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex w-full min-w-0 max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:gap-4">
        <Link
          href="/dashboard"
          className="inline-flex h-8 min-w-0 shrink items-center gap-2 font-semibold tracking-tight text-zinc-900 sm:gap-2.5"
        >
          <Image
            src="/stockhub-logo.svg"
            alt=""
            width={32}
            height={32}
            className="block h-8 w-8 shrink-0"
            priority
          />
          <span className="hidden h-8 items-center text-[28px] leading-[32px] translate-y-px sm:flex">
            StockHub
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-4">
          <ul className="hidden items-center gap-x-4 text-sm md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={navLinkClass(isActive(link.href))}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 sm:gap-2 md:border-l md:border-zinc-200 md:pl-4">
            <ProfileNavLink />
            <NotificationsNavLink />
            <MessagesNavLink />
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="mobile-nav-menu"
            className="absolute left-0 right-0 top-full z-50 border-b border-zinc-200 bg-white shadow-lg md:hidden"
          >
            <ul className="divide-y divide-zinc-100">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={navLinkClass(isActive(link.href), true)}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </header>
  );
}
