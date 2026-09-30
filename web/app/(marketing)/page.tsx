import Image from "next/image";
import Link from "next/link";

import {
  PageContainer,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/PageContainer";

export default function HomePage() {
  return (
    <div className="flex min-h-full min-w-0 w-full flex-1 flex-col bg-zinc-50">
      <PageContainer
        padding="marketing"
        className="flex flex-1 flex-col items-center justify-center"
      >
        <div className="flex w-full max-w-xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-4">
            <Image
              src="/stockhub-logo.svg"
              alt=""
              width={72}
              height={72}
              className="block h-[4.5rem] w-[4.5rem] shrink-0"
              priority
            />
            <h1 className="text-4xl font-semibold leading-none tracking-tight text-zinc-900 sm:text-5xl">
              StockHub
            </h1>
          </div>
          <p className="mt-6 text-xl font-medium leading-snug tracking-tight text-zinc-700 sm:text-2xl">
            Warehouse and inventory, in one place
          </p>
          <p className="mt-4 text-lg leading-relaxed text-zinc-600">
            Track stock, supplier orders, and customer orders with clear workflows
            and notifications—built for small teams that outgrew the spreadsheet.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/login"
              className={`${primaryButtonClassName} w-full px-8 sm:w-auto sm:min-w-40`}
            >
              Log in
            </Link>
            <Link
              href="/register"
              className={`${secondaryButtonClassName} w-full px-8 sm:w-auto sm:min-w-40`}
            >
              Create an account
            </Link>
          </div>
          <p className="mt-6 text-sm text-zinc-500">
            Already using StockHub?{" "}
            <Link
              href="/login"
              className="font-medium text-zinc-800 underline-offset-4 hover:underline"
            >
              Sign in here
            </Link>
            .
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
