"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LoadingText } from "@/components/ContentSkeletons";
import { apiErrorMessage } from "@/lib/api-client";
import { fetchDashboardSummary, type DashboardSummary } from "@/lib/dashboard";
import { canManageAdminCatalog } from "@/lib/roles";

type DashboardAttentionProps = {
  role: string | undefined | null;
};

type SectionLinkRowItem = {
  id: string;
  count: number;
  label: string;
  href: string;
};

function DashboardSection({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
      <h2 className="text-base font-semibold text-zinc-900">
        <Link href={href} className="hover:text-sky-800">
          {title}
        </Link>
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SectionLinkRow({
  count,
  label,
  href,
}: Omit<SectionLinkRowItem, "id">) {
  return (
    <Link
      href={href}
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2.5 text-sm hover:bg-zinc-100/80"
    >
      <span className="text-zinc-800">
        <span className="font-semibold tabular-nums text-zinc-900">{count}</span>{" "}
        {label}
      </span>
      <span className="font-medium text-sky-700">View →</span>
    </Link>
  );
}

function SectionEmpty({ message }: { message: string }) {
  return <p className="text-sm text-zinc-600">{message}</p>;
}

function buildArticleRows(summary: DashboardSummary): SectionLinkRowItem[] {
  if (summary.lowStockArticles <= 0) {
    return [];
  }
  return [
    {
      id: "low-stock",
      count: summary.lowStockArticles,
      label:
        summary.lowStockArticles === 1
          ? "article low on stock"
          : "articles low on stock",
      href: "/articles?lowStock=true&active=true",
    },
  ];
}

function buildCustomerOrderRows(summary: DashboardSummary): SectionLinkRowItem[] {
  if (summary.customerOrdersOpen <= 0) {
    return [];
  }
  return [
    {
      id: "customer-open",
      count: summary.customerOrdersOpen,
      label:
        summary.customerOrdersOpen === 1
          ? "customer order awaiting pickup"
          : "customer orders awaiting pickup",
      href: "/customer-orders?status=OPEN",
    },
  ];
}

function buildSupplierOrderRows(
  summary: DashboardSummary,
  isAdmin: boolean,
): SectionLinkRowItem[] {
  const rows: SectionLinkRowItem[] = [];

  if (summary.supplierOrdersPending > 0) {
    rows.push({
      id: "supplier-pending",
      count: summary.supplierOrdersPending,
      label:
        summary.supplierOrdersPending === 1
          ? "supplier order awaiting arrival"
          : "supplier orders awaiting arrival",
      href: "/supplier-orders?status=PENDING",
    });
  }

  if (summary.supplierOrdersChecking > 0) {
    rows.push({
      id: "supplier-checking",
      count: summary.supplierOrdersChecking,
      label:
        summary.supplierOrdersChecking === 1
          ? "supplier order needs checking"
          : "supplier orders need checking",
      href: "/supplier-orders?status=ARRIVED_CHECKING",
    });
  }

  if (isAdmin && summary.supplierOrdersChecked > 0) {
    rows.push({
      id: "supplier-checked",
      count: summary.supplierOrdersChecked,
      label:
        summary.supplierOrdersChecked === 1
          ? "supplier order ready to close"
          : "supplier orders ready to close",
      href: "/supplier-orders?status=CHECKED",
    });
  }

  return rows;
}

function SectionRows({ rows, emptyMessage }: { rows: SectionLinkRowItem[]; emptyMessage: string }) {
  if (rows.length === 0) {
    return <SectionEmpty message={emptyMessage} />;
  }

  return (
    <ul className="space-y-2">
      {rows.map(({ id, count, label, href }) => (
        <li key={id}>
          <SectionLinkRow count={count} label={label} href={href} />
        </li>
      ))}
    </ul>
  );
}

export function DashboardAttention({ role }: DashboardAttentionProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = canManageAdminCatalog(role);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDashboardSummary();
        if (!cancelled) {
          setSummary(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(apiErrorMessage(e, "Failed to load dashboard summary"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const articleRows = useMemo(
    () => (summary ? buildArticleRows(summary) : []),
    [summary],
  );
  const customerOrderRows = useMemo(
    () => (summary ? buildCustomerOrderRows(summary) : []),
    [summary],
  );
  const supplierOrderRows = useMemo(
    () => (summary ? buildSupplierOrderRows(summary, isAdmin) : []),
    [isAdmin, summary],
  );

  if (loading && !summary) {
    return (
      <div className="mt-8 grid gap-4 lg:grid-cols-1">
        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
          <h2 className="text-base font-semibold text-zinc-900">
            <Link href="/articles" className="hover:text-sky-800">
              Articles
            </Link>
          </h2>
          <LoadingText className="mt-3 flex text-zinc-500" label="Loading articles" />
        </section>
        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
          <h2 className="text-base font-semibold text-zinc-900">
            <Link href="/customer-orders" className="hover:text-sky-800">
              Customer orders
            </Link>
          </h2>
          <LoadingText className="mt-3 flex text-zinc-500" label="Loading customer orders" />
        </section>
        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
          <h2 className="text-base font-semibold text-zinc-900">
            <Link href="/supplier-orders" className="hover:text-sky-800">
              Supplier orders
            </Link>
          </h2>
          <LoadingText className="mt-3 flex text-zinc-500" label="Loading supplier orders" />
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <p className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </p>
    );
  }

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-1">
      <DashboardSection title="Articles" href="/articles">
        <SectionRows
          rows={articleRows}
          emptyMessage="No stock needs replenishing."
        />
      </DashboardSection>

      <DashboardSection title="Customer orders" href="/customer-orders">
        <SectionRows
          rows={customerOrderRows}
          emptyMessage="No pending customer orders."
        />
      </DashboardSection>

      <DashboardSection title="Supplier orders" href="/supplier-orders">
        <SectionRows
          rows={supplierOrderRows}
          emptyMessage="No pending supplier orders."
        />
      </DashboardSection>
    </div>
  );
}
