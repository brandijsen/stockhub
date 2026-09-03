"use client";

import { type FormEvent, useMemo, useState } from "react";

import { articleFormInputClass } from "@/components/article-form/input-styles";
import { Spinner } from "@/components/Spinner";
import { apiErrorMessage } from "@/lib/api-client";
import {
  closeSupplierOrder,
  type CloseSupplierOrderOutcome,
  type SupplierOrder,
} from "@/lib/supplier-orders";

type SupplierOrderCloseSectionProps = {
  order: SupplierOrder;
  onClosed: (order: SupplierOrder) => void;
};

export function SupplierOrderCloseSection({
  order,
  onClosed,
}: SupplierOrderCloseSectionProps) {
  const hasNonConformLine = useMemo(
    () => order.lines.some((line) => line.lineConform === false),
    [order.lines],
  );

  const [outcome, setOutcome] = useState<CloseSupplierOrderOutcome>(
    hasNonConformLine ? "DONE" : "SUCCEEDED",
  );
  const [adminCloseNote, setAdminCloseNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    !saving &&
    (outcome === "SUCCEEDED" ||
      (outcome === "DONE" && adminCloseNote.trim().length > 0));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const label =
      outcome === "SUCCEEDED"
        ? "close this order as succeeded and load stock"
        : "close this order with reported issues (no automatic stock load)";

    if (!window.confirm(`Confirm you want to ${label}?`)) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await closeSupplierOrder(order.id, {
        outcome,
        adminCloseNote:
          outcome === "DONE" ? adminCloseNote.trim() : adminCloseNote.trim() || null,
      });
      onClosed(result.order);
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to close supplier order"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="mt-6 rounded-lg border border-violet-200 bg-violet-50/40 p-4 sm:p-6"
    >
      <h2 className="text-lg font-medium text-zinc-900">Admin closure</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Choose the final outcome after checking. Only admins can close an order.
      </p>

      {hasNonConformLine ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          One or more lines are not conforming. Close with issues unless
          everything was resolved manually.
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        <label className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-3">
          <input
            type="radio"
            name="close-outcome"
            value="SUCCEEDED"
            checked={outcome === "SUCCEEDED"}
            disabled={saving || hasNonConformLine}
            onChange={() => setOutcome("SUCCEEDED")}
            className="mt-1"
          />
          <span>
            <span className="block font-medium text-zinc-900">Succeeded</span>
            <span className="block text-sm text-zinc-600">
              Everything matches checking. Stock is loaded automatically.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-3">
          <input
            type="radio"
            name="close-outcome"
            value="DONE"
            checked={outcome === "DONE"}
            disabled={saving}
            onChange={() => setOutcome("DONE")}
            className="mt-1"
          />
          <span>
            <span className="block font-medium text-zinc-900">
              Done with issues
            </span>
            <span className="block text-sm text-zinc-600">
              Discrepancies remain. No automatic stock load.
            </span>
          </span>
        </label>
      </div>

      {outcome === "DONE" ? (
        <div className="mt-4">
          <label
            htmlFor="admin-close-note"
            className="block text-sm font-medium text-zinc-600"
          >
            Issue note
          </label>
          <textarea
            id="admin-close-note"
            rows={4}
            required
            value={adminCloseNote}
            disabled={saving}
            onChange={(event) => setAdminCloseNote(event.target.value)}
            className={`mt-1 ${articleFormInputClass}`}
            placeholder="Describe the discrepancy for the team."
          />
        </div>
      ) : (
        <div className="mt-4">
          <label
            htmlFor="admin-close-note-optional"
            className="block text-sm font-medium text-zinc-600"
          >
            Note <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <textarea
            id="admin-close-note-optional"
            rows={2}
            value={adminCloseNote}
            disabled={saving}
            onChange={(event) => setAdminCloseNote(event.target.value)}
            className={`mt-1 ${articleFormInputClass}`}
          />
        </div>
      )}

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? (
          <span className="inline-flex items-center gap-2">
            <Spinner className="h-4 w-4 text-white" />
            Closing…
          </span>
        ) : outcome === "SUCCEEDED" ? (
          "Close as succeeded"
        ) : (
          "Close with issues"
        )}
      </button>
    </form>
  );
}
