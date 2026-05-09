import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3">
        <Link href="/articles" className="font-semibold text-zinc-900">
          StockHub
        </Link>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-700">
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
        </ul>
      </nav>
    </header>
  );
}
