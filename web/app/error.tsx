"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/PageContainer";
import { StatusPageLayout } from "@/components/StatusPageLayout";

const AUTHENTICATED_PREFIXES = [
  "/dashboard",
  "/articles",
  "/customers",
  "/customer-orders",
  "/suppliers",
  "/supplier-orders",
  "/staff",
  "/messages",
  "/notifications",
  "/profile",
];

function isAuthenticatedArea(pathname: string): boolean {
  return AUTHENTICATED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const inApp = isAuthenticatedArea(pathname);
  const brandHref = inApp ? "/dashboard" : "/";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPageLayout
      brandHref={brandHref}
      code="Error"
      title="Something went wrong"
      description={
        <>
          <p>
            An unexpected error occurred while loading this page. You can try
            again or return to a safe place.
          </p>
          {error.digest ? (
            <p className="mt-3 font-mono text-xs text-zinc-500">
              Reference: {error.digest}
            </p>
          ) : null}
        </>
      }
    >
      <button
        type="button"
        onClick={() => reset()}
        className={primaryButtonClassName}
      >
        Try again
      </button>
      <Link
        href={brandHref}
        className={secondaryButtonClassName}
      >
        {inApp ? "Go to dashboard" : "Back to home"}
      </Link>
    </StatusPageLayout>
  );
}
