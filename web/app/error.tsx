"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
      <h1 className="text-xl font-semibold text-zinc-900">Something went wrong</h1>
      <p className="mt-2 max-w-md text-center text-sm text-zinc-600">
        An unexpected error occurred while loading this page. You can try again or go
        back to the home page.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
