"use client";

import { type FormEvent, useEffect, useState } from "react";

import { articleFormInputClass } from "@/components/article-form/input-styles";
import { apiErrorMessage } from "@/lib/api-client";
import {
  createCustomer,
  emptyCustomerForm,
  customerToFormValues,
  type Customer,
  type CustomerFormValues,
  updateCustomer,
} from "@/lib/customers";

type CustomerFormProps = {
  customer: Customer | null;
  onSaved: (customer: Customer) => void;
  onCancel: () => void;
};

export function CustomerForm({
  customer,
  onSaved,
  onCancel,
}: CustomerFormProps) {
  const isEdit = customer != null;
  const [values, setValues] = useState<CustomerFormValues>(() =>
    customer ? customerToFormValues(customer) : emptyCustomerForm(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(customer ? customerToFormValues(customer) : emptyCustomerForm());
    setError(null);
  }, [customer]);

  const canSubmit =
    values.name.trim().length > 0 &&
    values.email.trim().length > 0 &&
    !saving;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const saved = isEdit
        ? await updateCustomer(customer.id, values)
        : await createCustomer(values);
      onSaved(saved);
    } catch (e) {
      setError(
        apiErrorMessage(
          e,
          isEdit ? "Failed to update customer" : "Failed to create customer",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-900">
        {isEdit ? "Edit customer" : "New customer"}
      </h2>
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="mt-4 space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="customer-name"
              className="block text-sm font-medium text-zinc-600"
            >
              Name
            </label>
            <input
              id="customer-name"
              type="text"
              required
              value={values.name}
              disabled={saving}
              onChange={(event) =>
                setValues((current) => ({ ...current, name: event.target.value }))
              }
              className={`mt-1 ${articleFormInputClass}`}
            />
          </div>
          <div>
            <label
              htmlFor="customer-email"
              className="block text-sm font-medium text-zinc-600"
            >
              Email
            </label>
            <input
              id="customer-email"
              type="email"
              required
              autoComplete="email"
              value={values.email}
              disabled={saving}
              onChange={(event) =>
                setValues((current) => ({ ...current, email: event.target.value }))
              }
              className={`mt-1 ${articleFormInputClass}`}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="customer-phone"
            className="block text-sm font-medium text-zinc-600"
          >
            Phone <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <input
            id="customer-phone"
            type="tel"
            value={values.phone}
            disabled={saving}
            onChange={(event) =>
              setValues((current) => ({ ...current, phone: event.target.value }))
            }
            className={`mt-1 ${articleFormInputClass}`}
          />
        </div>

        <div>
          <label
            htmlFor="customer-address"
            className="block text-sm font-medium text-zinc-600"
          >
            Address <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <textarea
            id="customer-address"
            rows={3}
            value={values.address}
            disabled={saving}
            onChange={(event) =>
              setValues((current) => ({ ...current, address: event.target.value }))
            }
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
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create customer"}
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
