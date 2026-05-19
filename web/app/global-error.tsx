"use client";

import "./globals.css";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 antialiased">
        <h1 className="text-xl font-semibold text-zinc-900">StockHub — error</h1>
        <p className="mt-2 max-w-md text-center text-sm text-zinc-600">
          A critical error occurred. Please reload the application.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
