import Link from "next/link";

import { getSession } from "@/lib/session";

export default async function NotFound() {
  const user = await getSession();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-4 py-16 text-center">
      <p className="text-sm font-medium text-zinc-500">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
        This page could not be found
      </h1>
      <p className="mt-3 text-sm text-zinc-600">
        Check the URL (typos, old bookmarks). API calls like registration use{" "}
        <span className="font-medium text-zinc-800">POST</span>, not a browser
        address for <code className="text-zinc-800">/api/…</code>.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {user ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Go to dashboard
          </Link>
        ) : (
          <Link
            href="/"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Back to home
          </Link>
        )}
      </div>
    </div>
  );
}
