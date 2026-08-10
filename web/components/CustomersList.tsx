"use client";

import { useCallback, useState } from "react";

import { LoadingText } from "@/components/ContentSkeletons";
import type { Customer } from "@/lib/customers";

import { CustomerForm } from "./customers-list/CustomerForm";
import { CustomersListTable } from "./customers-list/CustomersListTable";
import { useCustomersList } from "./customers-list/useCustomersList";

type CustomersListProps = {
  canManage: boolean;
};

export function CustomersList({ canManage }: CustomersListProps) {
  const {
    customers,
    loading,
    refreshing,
    error,
    refresh,
    replaceCustomer,
    removeCustomer,
    prependCustomer,
  } = useCustomersList();

  const [formMode, setFormMode] = useState<"closed" | "create" | "edit">(
    "closed",
  );
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const closeForm = useCallback(() => {
    setFormMode("closed");
    setEditingCustomer(null);
    setActionError(null);
  }, []);

  const handleSaved = useCallback(
    (customer: Customer) => {
      if (formMode === "edit") {
        replaceCustomer(customer);
      } else {
        prependCustomer(customer);
      }
      closeForm();
    },
    [closeForm, formMode, prependCustomer, replaceCustomer],
  );

  const displayError = actionError ?? error;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Customers</h1>
          <p className="mt-1 text-zinc-600">
            Customer contacts for sales orders.
            {canManage
              ? " Admins can add and edit customers."
              : " You can view the list; only admins can make changes."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading || refreshing}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          {canManage && formMode === "closed" ? (
            <button
              type="button"
              onClick={() => {
                setEditingCustomer(null);
                setFormMode("create");
                setActionError(null);
              }}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Add customer
            </button>
          ) : null}
        </div>
      </div>

      {displayError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {displayError}
        </p>
      ) : null}

      {formMode !== "closed" ? (
        <div className="mt-6">
          <CustomerForm
            customer={formMode === "edit" ? editingCustomer : null}
            onSaved={handleSaved}
            onCancel={closeForm}
          />
        </div>
      ) : null}

      {loading && customers.length === 0 ? (
        <LoadingText />
      ) : customers.length === 0 ? (
        <p className="mt-8 text-zinc-600">
          No customers yet.
          {canManage ? " Add your first customer to get started." : null}
        </p>
      ) : (
        <div className={loading || refreshing ? "opacity-60" : undefined}>
          <CustomersListTable
            customers={customers}
            canManage={canManage}
            deletingId={deletingId}
            onEdit={(customer) => {
              setEditingCustomer(customer);
              setFormMode("edit");
              setActionError(null);
            }}
            onDeleteStart={setDeletingId}
            onDeleteEnd={() => setDeletingId(null)}
            onDeleted={(id) => {
              removeCustomer(id);
              setActionError(null);
            }}
            onDeleteError={setActionError}
          />
        </div>
      )}
    </div>
  );
}
