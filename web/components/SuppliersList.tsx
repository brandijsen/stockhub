"use client";

import { useCallback, useState } from "react";

import { Spinner } from "@/components/Spinner";
import type { Supplier } from "@/lib/suppliers";

import { SupplierForm } from "./suppliers-list/SupplierForm";
import { SuppliersListTable } from "./suppliers-list/SuppliersListTable";
import { useSuppliersList } from "./suppliers-list/useSuppliersList";

type SuppliersListProps = {
  canManage: boolean;
};

export function SuppliersList({ canManage }: SuppliersListProps) {
  const {
    suppliers,
    loading,
    refreshing,
    error,
    refresh,
    replaceSupplier,
    removeSupplier,
    prependSupplier,
  } = useSuppliersList();

  const [formMode, setFormMode] = useState<"closed" | "create" | "edit">(
    "closed",
  );
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const closeForm = useCallback(() => {
    setFormMode("closed");
    setEditingSupplier(null);
    setActionError(null);
  }, []);

  const handleSaved = useCallback(
    (supplier: Supplier) => {
      if (formMode === "edit") {
        replaceSupplier(supplier);
      } else {
        prependSupplier(supplier);
      }
      closeForm();
    },
    [closeForm, formMode, prependSupplier, replaceSupplier],
  );

  const displayError = actionError ?? error;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Suppliers</h1>
          <p className="mt-1 text-zinc-600">
            Supplier contacts for purchase orders.
            {canManage
              ? " Admins can add and edit suppliers."
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
                setEditingSupplier(null);
                setFormMode("create");
                setActionError(null);
              }}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Add supplier
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
          <SupplierForm
            supplier={formMode === "edit" ? editingSupplier : null}
            onSaved={handleSaved}
            onCancel={closeForm}
          />
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-zinc-600">
          <Spinner label="Loading suppliers" />
          <span>Loading suppliers…</span>
        </div>
      ) : suppliers.length === 0 ? (
        <p className="mt-8 text-zinc-600">
          No suppliers yet.
          {canManage ? " Add your first supplier to get started." : null}
        </p>
      ) : (
        <SuppliersListTable
          suppliers={suppliers}
          canManage={canManage}
          deletingId={deletingId}
          onEdit={(supplier) => {
            setEditingSupplier(supplier);
            setFormMode("edit");
            setActionError(null);
          }}
          onDeleteStart={setDeletingId}
          onDeleteEnd={() => setDeletingId(null)}
          onDeleted={(id) => {
            removeSupplier(id);
            setActionError(null);
          }}
          onDeleteError={setActionError}
        />
      )}
    </div>
  );
}
