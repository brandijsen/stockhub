import Image from "next/image";
import Link from "next/link";

type FooterProps = {
  brandHref?: string;
};

export function Footer({ brandHref = "/dashboard" }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full overflow-x-clip border-t border-zinc-200 bg-white">
      <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={brandHref}
          className="inline-flex h-7 items-center gap-2 font-semibold tracking-tight text-zinc-900"
        >
          <Image
            src="/stockhub-logo.svg"
            alt=""
            width={24}
            height={24}
            className="block h-6 w-6 shrink-0"
          />
          <span className="text-lg leading-none">StockHub</span>
        </Link>

        <p className="min-w-0 text-sm text-zinc-500">
          Warehouse and inventory management
        </p>

        <p className="text-sm text-zinc-500">© {year} StockHub</p>
      </div>
    </footer>
  );
}
