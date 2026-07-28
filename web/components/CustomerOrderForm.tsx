"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { articleFormInputClass } from "@/components/article-form/input-styles";
import { Spinner } from "@/components/Spinner";
import { apiErrorMessage } from "@/lib/api-client";
import { fetchArticles, type Article } from "@/lib/articles";
import { createCustomerOrder } from "@/lib/customer-orders";
import { fetchCustomers, type Customer } from "@/lib/customers";

type DraftLine = {
  key: string;
  articleId: string;
  quantity: string;
};

function newDraftLine(): DraftLine {
  return {
    key: crypto.randomUUID(),
    articleId: "",
    quantity: "1",
  };
}

export function CustomerOrderForm() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([newDraftLine()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingOptions(true);
      setOptionsError(null);
      try {
        const [customerList, articleResponse] = await Promise.all([
          fetchCustomers(),
          fetchArticles({ page: 1, limit: 100, active: true }),
        ]);
        if (cancelled) {
          return;
        }
        setCustomers(customerList);
        setArticles(articleResponse.articles);
        if (customerList.length === 1) {
          setCustomerId(customerList[0].id);
        }
      } catch (e) {
        if (!cancelled) {
          setOptionsError(apiErrorMessage(e, "Failed to load form options"));
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
  }, []);

  const canSubmit =
    customerId !== "" &&
    lines.some(
      (line) =>
        line.articleId !== "" &&
        Number.parseInt(line.quantity, 10) > 0,
    ) &&
    !saving &&
    !loadingOptions;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const payloadLines = lines
      .filter((line) => line.articleId !== "")
      .map((line) => ({
        articleId: line.articleId,
        quantity: Number.parseInt(line.quantity, 10),
      }))
      .filter((line) => line.quantity > 0);

    if (payloadLines.length === 0) {
      setError("Add at least one order line.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const order = await createCustomerOrder({
        customerId,
        lines: payloadLines,
      });
      router.push(`/customer-orders/${order.id}`);
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to create customer order"));
    } finally {
      setSaving(false);
    }
  }

  if (loadingOptions) {
    return (
      <div className="mt-8 flex items-center gap-2 text-zinc-600">
        <Spinner label="Loading form" />
        <span>Loading customers and articles…</span>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
      {optionsError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {optionsError}
        </p>
      ) : null}

      <div>
        <label
          htmlFor="customer-order-customer"
          className="block text-sm font-medium text-zinc-600"
        >
          Customer
        </label>
        <select
          id="customer-order-customer"
          required
          value={customerId}
          disabled={saving || customers.length === 0}
          onChange={(event) => setCustomerId(event.target.value)}
          className={`mt-1 ${articleFormInputClass}`}
        >
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
        {customers.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">
            No customers yet.{" "}
            <Link href="/customers" className="font-medium text-sky-700">
              Add a customer
            </Link>{" "}
            first.
          </p>
        ) : null}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-zinc-800">Order lines</h2>
          <button
            type="button"
            disabled={saving}
            onClick={() => setLines((current) => [...current, newDraftLine()])}
            className="text-sm font-medium text-sky-700 hover:text-sky-900 disabled:opacity-50"
          >
            Add line
          </button>
        </div>
        <ul className="mt-3 space-y-3">
          {lines.map((line, index) => (
            <li
              key={line.key}
              className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 sm:grid-cols-[1fr_120px_auto]"
            >
              <select
                required={index === 0}
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
                <option value="">Select article</option>
                {articles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.code} — {article.name} (stock {article.stock})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                required={line.articleId !== ""}
                value={line.quantity}
                disabled={saving}
                onChange={(event) =>
                  setLines((current) =>
                    current.map((item) =>
                      item.key === line.key
                        ? { ...item, quantity: event.target.value }
                        : item,
                    ),
                  )
                }
                className={articleFormInputClass}
              />
              <button
                type="button"
                disabled={saving || lines.length === 1}
                onClick={() =>
                  setLines((current) =>
                    current.filter((item) => item.key !== line.key),
                  )
                }
                className="text-sm font-medium text-red-700 hover:text-red-900 disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create order"}
        </button>
        <Link
          href="/customer-orders"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
