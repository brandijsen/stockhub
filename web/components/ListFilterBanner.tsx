import Link from "next/link";

type ListFilterBannerProps = {
  label: string;
  clearHref: string;
};

export function ListFilterBanner({ label, clearHref }: ListFilterBannerProps) {
  return (
    <p className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
      Filter: {label}.{" "}
      <Link href={clearHref} className="font-medium text-sky-800 underline">
        Show all
      </Link>
    </p>
  );
}
