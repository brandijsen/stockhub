"use client";

import { type FormEvent, useMemo, useState } from "react";

import { articleFormInputClass } from "@/components/article-form/input-styles";
import { Spinner } from "@/components/Spinner";
import { apiErrorMessage } from "@/lib/api-client";
import { adjustArticleStock, type Article } from "@/lib/articles";

type ArticleStockAdjustSectionProps = {
  article: Article;
  onAdjusted: (article: Article) => void;
};

export function ArticleStockAdjustSection({
  article,
  onAdjusted,
}: ArticleStockAdjustSectionProps) {
  const [deltaInput, setDeltaInput] = useState("1");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const delta = Number.parseInt(deltaInput, 10);
  const parsedDelta = Number.isFinite(delta) ? delta : 0;
  const projectedStock = article.stock + parsedDelta;

  const canSubmit = useMemo(() => {
    if (saving) {
      return false;
    }
    if (!Number.isFinite(delta) || delta === 0) {
      return false;
    }
    return projectedStock >= 0;
  }, [delta, projectedStock, saving]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await adjustArticleStock(article.id, {
        delta,
        note: note.trim() || null,
      });
      onAdjusted(updated);
      setSuccess(
        delta > 0
          ? `Stock increased by ${delta}.`
          : `Stock decreased by ${Math.abs(delta)}.`,
      );
      setDeltaInput("1");
      setNote("");
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to adjust stock"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-900">Adjust stock</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Manual correction for the current stock level. Other team members receive
        a notification.
      </p>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="mt-4 space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="stock-delta"
              className="block text-sm font-medium text-zinc-600"
            >
              Change (+ or −)
            </label>
            <input
              id="stock-delta"
              type="number"
              step={1}
              required
              value={deltaInput}
              disabled={saving}
              onChange={(event) => setDeltaInput(event.target.value)}
              className={`mt-1 ${articleFormInputClass}`}
            />
            <p className="mt-1 text-xs text-zinc-500">
              Current: {article.stock} → after:{" "}
              {projectedStock >= 0 ? projectedStock : "invalid"}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => setDeltaInput("1")}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              +1
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setDeltaInput("-1")}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              −1
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setDeltaInput("5")}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              +5
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setDeltaInput("-5")}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              −5
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="stock-adjust-note"
            className="block text-sm font-medium text-zinc-600"
          >
            Note <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <textarea
            id="stock-adjust-note"
            rows={2}
            value={note}
            disabled={saving}
            onChange={(event) => setNote(event.target.value)}
            className={`mt-1 ${articleFormInputClass}`}
            placeholder="Reason for the adjustment"
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              Saving…
            </span>
          ) : (
            "Apply adjustment"
          )}
        </button>
      </form>
    </section>
  );
}
