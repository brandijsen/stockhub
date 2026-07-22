"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { articleFormInputClass } from "@/components/article-form/input-styles";
import { Spinner } from "@/components/Spinner";
import { apiErrorMessage } from "@/lib/api-client";
import { fetchArticles, type Article } from "@/lib/articles";
import { createSupplierOrder, updateSupplierOrder, type SupplierOrder } from "@/lib/supplier-orders";
import { fetchSuppliers, type Supplier } from "@/lib/suppliers";

type DraftLine = {
  key: string;
  articleId: string;
  qtyOrdered: string;
};

function newDraftLine(): DraftLine {
  return {
    key: crypto.randomUUID(),
    articleId: "",
    qtyOrdered: "1",
  };
}

function sortArticlesForPicker(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => {
    if (a.lowStock !== b.lowStock) {
      return a.lowStock ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

export function SupplierOrderForm({ order }: { order?: SupplierOrder }) {
  const isEdit = order != null;
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [supplierId, setSupplierId] = useState(order?.supplier.id ?? "");
  const [lines, setLines] = useState<DraftLine[]>(() =>
    order
      ? order.lines.map((line) => ({
          key: line.id,
          articleId: line.articleId,
          qtyOrdered: String(line.qtyOrdered),
        }))
      : [newDraftLine()],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedArticles = useMemo(
    () => sortArticlesForPicker(articles),
    [articles],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingOptions(true);
      setOptionsError(null);
      try {
        const [supplierList, articleResponse] = await Promise.all([
          fetchSuppliers(),
          fetchArticles({ page: 1, limit: 100, active: true }),
        ]);
        if (cancelled) {
          return;
        }
        setSuppliers(supplierList);
        setArticles(articleResponse.articles);
        if (!isEdit && supplierList.length === 1) {
          setSupplierId(supplierList[0].id);
        }
      } catch (e) {
        if (!cancelled) {
          setOptionsError(apiErrorMessage(e, "Failed to load form data"));
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [isEdit]);

  const validLineCount = lines.filter(
    (line) =>
      line.articleId &&
      Number.parseInt(line.qtyOrdered, 10) >= 1,
  ).length;

  const canSubmit =
    supplierId.length > 0 && validLineCount >= 1 && !saving && !loadingOptions;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const payloadLines = lines
      .map((line) => ({
        articleId: line.articleId,
        qtyOrdered: Number.parseInt(line.qtyOrdered, 10),
      }))
      .filter((line) => line.articleId && line.qtyOrdered >= 1);

    const seen = new Set<string>();
    for (const line of payloadLines) {
      if (seen.has(line.articleId)) {
        setError("Each article can appear only once in the order.");
        return;
      }
      seen.add(line.articleId);
    }

    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await updateSupplierOrder(order.id, {
          supplierId,
          lines: payloadLines,
        });
        router.push(`/supplier-orders/${order.id}`);
      } else {
        const result = await createSupplierOrder({
          supplierId,
          lines: payloadLines,
        });
        router.push(`/supplier-orders/${result.order.id}`);
      }
    } catch (e) {
      setError(
        apiErrorMessage(
          e,
          isEdit
            ? "Failed to update supplier order"
            : "Failed to create supplier order",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  if (loadingOptions) {
    return (
      <div className="flex items-center gap-2 text-zinc-600">
        <Spinner label="Loading form" />
        <span>Loading suppliers and articles…</span>
      </div>
    );
  }

  if (optionsError) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {optionsError}
      </p>
    );
  }

  if (suppliers.length === 0) {
    return (
      <p className="text-zinc-600">
        Add a supplier first on{" "}
        <Link href="/suppliers" className="font-medium text-sky-700 hover:underline">
          Suppliers
        </Link>
        .
      </p>
    );
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6"
    >
      <div>
        <label
          htmlFor="order-supplier"
          className="block text-sm font-medium text-zinc-600"
        >
          Supplier
        </label>
        <select
          id="order-supplier"
          required
          value={supplierId}
          disabled={saving}
          onChange={(event) => setSupplierId(event.target.value)}
          className={`mt-1 ${articleFormInputClass}`}
        >
          <option value="">Select supplier…</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name} ({supplier.email})
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium text-zinc-900">Order lines</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Low-stock articles appear first in the list.
            </p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => setLines((current) => [...current, newDraftLine()])}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Add line
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {lines.map((line, index) => (
            <div
              key={line.key}
              className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 sm:grid-cols-[1fr_120px_auto]"
            >
              <div>
                <label className="sr-only" htmlFor={`line-article-${line.key}`}>
                  Article {index + 1}
                </label>
                <select
                  id={`line-article-${line.key}`}
                  value={line.articleId}
                  disabled={saving}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item) =>
                        item.key === line.key
                          ? { ...item, articleId: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className={articleFormInputClass}
                >
                  <option value="">Select article…</option>
                  {sortedArticles.map((article) => (
                    <option key={article.id} value={article.id}>
                      {article.lowStock ? "[Low stock] " : ""}
                      {article.code} — {article.name} (stock {article.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="sr-only" htmlFor={`line-qty-${line.key}`}>
                  Quantity
                </label>
                <input
                  id={`line-qty-${line.key}`}
                  type="number"
                  min={1}
                  required={Boolean(line.articleId)}
                  value={line.qtyOrdered}
                  disabled={saving}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item) =>
                        item.key === line.key
                          ? { ...item, qtyOrdered: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className={articleFormInputClass}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  disabled={saving || lines.length <= 1}
                  onClick={() =>
                    setLines((current) =>
                      current.filter((item) => item.key !== line.key),
                    )
                  }
                  className="rounded-lg px-2 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? isEdit
              ? "Saving…"
              : "Creating…"
            : isEdit
              ? "Save changes"
              : "Create order"}
        </button>
        <Link
          href={isEdit ? `/supplier-orders/${order.id}` : "/supplier-orders"}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
