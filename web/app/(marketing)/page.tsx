import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16 sm:py-24">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          StockHub
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Warehouse and inventory, in one place
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-600">
          Track stock, supplier orders, and customer orders with clear workflows
          and notifications—built for small teams that outgrew the spreadsheet.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-zinc-300 bg-white px-8 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
          >
            Create an account
          </Link>
        </div>
        <p className="mt-8 text-sm text-zinc-500">
          Already using StockHub?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-800 underline-offset-4 hover:underline"
          >
            Sign in here
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
