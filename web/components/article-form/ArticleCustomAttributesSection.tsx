"use client";

import { ArticleFormField } from "./ArticleFormField";
import { articleFormInputClass } from "./input-styles";
import type { ArticleCustomAttribute } from "@/lib/articles";
import { emptyCustomAttributeRow } from "@/lib/articles";

type ArticleCustomAttributesSectionProps = {
  rows: ArticleCustomAttribute[];
  onChange: (rows: ArticleCustomAttribute[]) => void;
};

export function ArticleCustomAttributesSection({
  rows,
  onChange,
}: ArticleCustomAttributesSectionProps) {
  function updateRow(
    index: number,
    patch: Partial<ArticleCustomAttribute>,
  ) {
    onChange(
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...rows, emptyCustomAttributeRow()]);
  }

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-medium text-zinc-900">Attributes</h2>
        <button
          type="button"
          onClick={addRow}
          className="text-sm text-zinc-700 underline hover:text-zinc-900"
        >
          Add attribute
        </button>
      </div>
      <p className="mt-1 text-sm text-zinc-600">
        Optional name–value pairs for this article only (e.g. Color → Red, Size
        → XL).
      </p>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">No attributes yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((row, index) => (
            <div
              key={index}
              className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            >
              <ArticleFormField label="Name">
                <input
                  value={row.name}
                  onChange={(e) => updateRow(index, { name: e.target.value })}
                  placeholder="e.g. Color"
                  className={articleFormInputClass}
                />
              </ArticleFormField>
              <ArticleFormField label="Value">
                <input
                  value={row.value}
                  onChange={(e) => updateRow(index, { value: e.target.value })}
                  placeholder="e.g. Red"
                  className={articleFormInputClass}
                />
              </ArticleFormField>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="pb-2 text-sm text-red-700 underline hover:text-red-900"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
