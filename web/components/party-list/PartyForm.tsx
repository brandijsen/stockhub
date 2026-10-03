"use client";

import { type FormEvent, useEffect, useState } from "react";

import { articleFormInputClass } from "@/components/article-form/input-styles";
import { apiErrorMessage } from "@/lib/api-client";

import type { PartyFormValues, PartyListCopy, PartyRecord } from "./types";

type PartyFormProps<T extends PartyRecord> = {
  item: T | null;
  emptyForm: () => PartyFormValues;
  toFormValues: (item: T) => PartyFormValues;
  createItem: (values: PartyFormValues) => Promise<T>;
  updateItem: (id: string, values: PartyFormValues) => Promise<T>;
  copy: PartyListCopy;
  onSaved: (item: T) => void;
  onCancel: () => void;
};

export function PartyForm<T extends PartyRecord>({
  item,
  emptyForm,
  toFormValues,
  createItem,
  updateItem,
  copy,
  onSaved,
  onCancel,
}: PartyFormProps<T>) {
  const isEdit = item != null;
  const [values, setValues] = useState<PartyFormValues>(() =>
    item ? toFormValues(item) : emptyForm(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(item ? toFormValues(item) : emptyForm());
    setError(null);
  }, [emptyForm, item, toFormValues]);

  const canSubmit = values.name.trim().length > 0 && !saving;

  function setField(key: keyof PartyFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const saved = isEdit
        ? await updateItem(item.id, values)
        : await createItem(values);
      onSaved(saved);
    } catch (e) {
      setError(apiErrorMessage(e, isEdit ? copy.updateError : copy.createError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-900">
        {isEdit ? copy.editTitle : copy.newTitle}
      </h2>
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="mt-4 space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${copy.idPrefix}-name`}
              className="block text-sm font-medium text-zinc-600"
            >
              Name
            </label>
            <input
              id={`${copy.idPrefix}-name`}
              type="text"
              required
              value={values.name}
              disabled={saving}
              onChange={(event) => setField("name", event.target.value)}
              className={`mt-1 ${articleFormInputClass}`}
            />
          </div>
          <div>
            <label
              htmlFor={`${copy.idPrefix}-email`}
              className="block text-sm font-medium text-zinc-600"
            >
              Email <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <input
              id={`${copy.idPrefix}-email`}
              type="email"
              autoComplete="email"
              value={values.email}
              disabled={saving}
              onChange={(event) => setField("email", event.target.value)}
              className={`mt-1 ${articleFormInputClass}`}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor={`${copy.idPrefix}-phone`}
            className="block text-sm font-medium text-zinc-600"
          >
            Phone <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <input
            id={`${copy.idPrefix}-phone`}
            type="tel"
            value={values.phone}
            disabled={saving}
            onChange={(event) => setField("phone", event.target.value)}
            className={`mt-1 ${articleFormInputClass}`}
          />
        </div>

        <div>
          <label
            htmlFor={`${copy.idPrefix}-address`}
            className="block text-sm font-medium text-zinc-600"
          >
            Address <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <textarea
            id={`${copy.idPrefix}-address`}
            rows={3}
            value={values.address}
            disabled={saving}
            onChange={(event) => setField("address", event.target.value)}
            className={`mt-1 ${articleFormInputClass}`}
          />
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
            {saving ? "Saving…" : isEdit ? "Save changes" : copy.createLabel}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
