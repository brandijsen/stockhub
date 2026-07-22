"use client";

import { type FormEvent, useEffect, useState } from "react";

import { articleFormInputClass } from "@/components/article-form/input-styles";
import { Spinner } from "@/components/Spinner";
import { apiErrorMessage } from "@/lib/api-client";
import {
  completeSupplierOrderChecking,
  type SupplierOrder,
} from "@/lib/supplier-orders";

type CheckingDraftLine = {
  lineId: string;
  qtyReceivedActual: string;
  lineConform: boolean;
};

type SupplierOrderCheckingSectionProps = {
  order: SupplierOrder;
  onCompleted: (order: SupplierOrder) => void;
};

export function SupplierOrderCheckingSection({
  order,
  onCompleted,
}: SupplierOrderCheckingSectionProps) {
  const [lines, setLines] = useState<CheckingDraftLine[]>(() =>
    order.lines.map((line) => ({
      lineId: line.id,
      qtyReceivedActual: String(line.qtyReceivedActual ?? line.qtyOrdered),
      lineConform: line.lineConform ?? true,
    })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLines(
      order.lines.map((line) => ({
        lineId: line.id,
        qtyReceivedActual: String(line.qtyReceivedActual ?? line.qtyOrdered),
        lineConform: line.lineConform ?? true,
      })),
    );
  }, [order]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = lines.map((line) => ({
      lineId: line.lineId,
      qtyReceivedActual: Number.parseInt(line.qtyReceivedActual, 10),
      lineConform: line.lineConform,
    }));

    for (const line of payload) {
      if (!Number.isFinite(line.qtyReceivedActual) || line.qtyReceivedActual < 0) {
        setError("Enter a valid received quantity for every line.");
        setSaving(false);
        return;
      }
    }

    try {
      const updated = await completeSupplierOrderChecking(order.id, payload);
      onCompleted(updated);
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to complete checking"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="mt-6 rounded-lg border border-sky-200 bg-sky-50/40 p-4 sm:p-6"
    >
      <h2 className="text-lg font-medium text-zinc-900">Goods checking</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Record received quantities and mark each line as conforming (V) or not.
        Any team member can complete this step.
      </p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-600">
            <tr>
              <th className="px-3 py-3 font-medium">Article</th>
              <th className="px-3 py-3 font-medium">Qty ordered</th>
              <th className="px-3 py-3 font-medium">Qty received</th>
              <th className="px-3 py-3 font-medium">Conform (V)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {order.lines.map((line) => {
              const draft = lines.find((item) => item.lineId === line.id);
              if (!draft) {
                return null;
              }

              return (
                <tr key={line.id}>
                  <td className="px-3 py-2">
                    <div className="font-mono text-zinc-900">{line.article.code}</div>
                    <div className="text-zinc-700">{line.article.name}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-zinc-900">
                    {line.qtyOrdered}
                  </td>
                  <td className="px-3 py-2">
                    <label className="sr-only" htmlFor={`received-${line.id}`}>
                      Received quantity for {line.article.code}
                    </label>
                    <input
                      id={`received-${line.id}`}
                      type="number"
                      min={0}
                      required
                      disabled={saving}
                      value={draft.qtyReceivedActual}
                      onChange={(event) =>
                        setLines((current) =>
                          current.map((item) =>
                            item.lineId === line.id
                              ? {
                                  ...item,
                                  qtyReceivedActual: event.target.value,
                                }
                              : item,
                          ),
                        )
                      }
                      className={`w-24 ${articleFormInputClass}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2 text-zinc-700">
                      <input
                        type="checkbox"
                        checked={draft.lineConform}
                        disabled={saving}
                        onChange={(event) =>
                          setLines((current) =>
                            current.map((item) =>
                              item.lineId === line.id
                                ? {
                                    ...item,
                                    lineConform: event.target.checked,
                                  }
                                : item,
                            ),
                          )
                        }
                        className="h-4 w-4 rounded border-zinc-300"
                      />
                      <span>V</span>
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {saving ? (
          <span className="inline-flex items-center gap-2">
            <Spinner className="h-4 w-4 text-white" />
            Completing…
          </span>
        ) : (
          "Complete checking"
        )}
      </button>
    </form>
  );
}
