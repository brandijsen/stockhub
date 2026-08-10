import Link from "next/link";

type OrderDetailHeaderProps = {
  backHref: string;
  backLabel: string;
  code: string;
  title: string;
  statusLabel: string;
  statusBadgeClass: string;
  createdAt: string;
  createdByName: string;
  formatDate: (iso: string) => string;
  extraMeta?: React.ReactNode;
  actions?: React.ReactNode;
};

export function OrderDetailHeader({
  backHref,
  backLabel,
  code,
  title,
  statusLabel,
  statusBadgeClass,
  createdAt,
  createdByName,
  formatDate,
  extraMeta,
  actions,
}: OrderDetailHeaderProps) {
  return (
    <>
      <Link
        href={backHref}
        className="text-sm font-medium text-sky-700 hover:text-sky-900"
      >
        ← {backLabel}
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-medium text-zinc-500">{code}</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900">{title}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Created {formatDate(createdAt)} by {createdByName}
          </p>
          {extraMeta}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${statusBadgeClass}`}
          >
            {statusLabel}
          </span>
          {actions}
        </div>
      </div>
    </>
  );
}

type OrderInfoCardsProps = {
  partyTitle: string;
  partyName: string;
  partyEmail: string;
  partyPhone?: string | null;
  lineCount: number;
  totalQty: number;
  totalQtyLabel: string;
};

export function OrderInfoCards({
  partyTitle,
  partyName,
  partyEmail,
  partyPhone,
  lineCount,
  totalQty,
  totalQtyLabel,
}: OrderInfoCardsProps) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
        <h2 className="font-medium text-zinc-900">{partyTitle}</h2>
        <p className="mt-2 font-medium text-zinc-900">{partyName}</p>
        <p className="mt-1 text-zinc-600">{partyEmail}</p>
        {partyPhone ? <p className="text-zinc-600">{partyPhone}</p> : null}
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
        <h2 className="font-medium text-zinc-900">Summary</h2>
        <p className="mt-2 text-zinc-600">
          {lineCount} line{lineCount === 1 ? "" : "s"} · {totalQty} {totalQtyLabel}
        </p>
      </div>
    </div>
  );
}

type OrderDetailErrorProps = {
  message: string;
  backHref: string;
  backLabel: string;
};

export function OrderDetailError({
  message,
  backHref,
  backLabel,
}: OrderDetailErrorProps) {
  return (
    <div>
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {message}
      </p>
      <Link
        href={backHref}
        className="mt-4 inline-block text-sm font-medium text-sky-700 hover:text-sky-900"
      >
        ← {backLabel}
      </Link>
    </div>
  );
}
