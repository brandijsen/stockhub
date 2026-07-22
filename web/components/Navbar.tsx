import Link from "next/link";

import { MessagesNavLink } from "@/components/MessagesNavLink";
import { NotificationsNavLink } from "@/components/NotificationsNavLink";
import { ProfileNavLink } from "@/components/ProfileNavLink";

export function Navbar() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3">
        <Link href="/dashboard" className="font-semibold text-zinc-900">
          StockHub
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-700">
            <li>
              <Link href="/dashboard" className="hover:text-zinc-900">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/articles" className="hover:text-zinc-900">
                Articles
              </Link>
            </li>
            <li>
              <Link href="/customers" className="hover:text-zinc-900">
                Customers
              </Link>
            </li>
            <li>
              <Link href="/customer-orders" className="hover:text-zinc-900">
                Customer orders
              </Link>
            </li>
            <li>
              <Link href="/suppliers" className="hover:text-zinc-900">
                Suppliers
              </Link>
            </li>
            <li>
              <Link href="/supplier-orders" className="hover:text-zinc-900">
                Supplier orders
              </Link>
            </li>
            <li>
              <Link href="/staff" className="hover:text-zinc-900">
                Staff
              </Link>
            </li>
          </ul>
          <div className="flex items-center gap-3 border-l border-zinc-200 pl-4">
            <ProfileNavLink />
            <NotificationsNavLink />
            <MessagesNavLink />
          </div>
        </div>
      </nav>
    </header>
  );
}
