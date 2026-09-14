import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Footer } from "@/components/Footer";

type StatusPageLayoutProps = {
  brandHref?: string;
  code: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
};

export function StatusPageLayout({
  brandHref = "/",
  code,
  title,
  description,
  children,
}: StatusPageLayoutProps) {
  return (
    <div className="flex min-h-full min-w-0 w-full flex-1 flex-col overflow-x-clip bg-zinc-50">
      <main className="mx-auto flex w-full min-w-0 max-w-lg flex-1 flex-col justify-center px-4 py-16">
        <div className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
          <Link
            href={brandHref}
            className="inline-flex h-8 items-center gap-2.5 font-semibold tracking-tight text-zinc-900"
          >
            <Image
              src="/stockhub-logo.svg"
              alt=""
              width={32}
              height={32}
              className="block h-8 w-8 shrink-0"
            />
            <span className="flex h-8 items-center text-[28px] leading-[32px] translate-y-px">
              StockHub
            </span>
          </Link>

          <p className="mt-10 text-6xl font-semibold tracking-tight text-zinc-900">
            {code}
          </p>
          <h1 className="mt-3 text-xl font-semibold text-zinc-900">{title}</h1>
          {description ? (
            <div className="mt-3 text-sm leading-relaxed text-zinc-600">
              {description}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">{children}</div>
        </div>
      </main>
      <Footer brandHref={brandHref} />
    </div>
  );
}
