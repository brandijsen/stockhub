"use client";

import { Spinner } from "@/components/Spinner";
import { apiErrorMessage } from "@/lib/api-client";
import { deleteSupplier, type Supplier } from "@/lib/suppliers";

type SuppliersListTableProps = {
  suppliers: Supplier[];
  canManage: boolean;
  deletingId: string | null;
  onEdit: (supplier: Supplier) => void;
  onDeleteStart: (id: string) => void;
  onDeleteEnd: () => void;
  onDeleted: (id: string) => void;
  onDeleteError: (message: string) => void;
};

export function SuppliersListTable({
  suppliers,
  canManage,
  deletingId,
  onEdit,
  onDeleteStart,
  onDeleteEnd,
  onDeleted,
  onDeleteError,
}: SuppliersListTableProps) {
  async function handleDelete(supplier: Supplier) {
    if (supplier.orderCount > 0) {
      onDeleteError(
        "This supplier has purchase orders and cannot be deleted.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete supplier "${supplier.name}"? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    onDeleteStart(supplier.id);
    try {
      await deleteSupplier(supplier.id);
      onDeleted(supplier.id);
    } catch (e) {
      onDeleteError(apiErrorMessage(e, "Failed to delete supplier"));
    } finally {
      onDeleteEnd();
    }
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-600">
          <tr>
            <th className="px-3 py-3 font-medium">Name</th>
            <th className="px-3 py-3 font-medium">Email</th>
            <th className="px-3 py-3 font-medium">Phone</th>
            <th className="px-3 py-3 font-medium">Orders</th>
            {canManage ? (
              <th className="px-3 py-3 font-medium">Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {suppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-zinc-50/80">
              <td className="px-3 py-2 font-medium text-zinc-900">
                {supplier.name}
              </td>
              <td className="px-3 py-2 text-zinc-600">{supplier.email}</td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                {supplier.phone ?? "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                {supplier.orderCount}
              </td>
              {canManage ? (
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(supplier)}
                      className="text-sm font-medium text-sky-700 hover:text-sky-900"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === supplier.id}
                      onClick={() => void handleDelete(supplier)}
                      className="text-sm font-medium text-red-700 hover:text-red-900 disabled:opacity-50"
                    >
                      {deletingId === supplier.id ? (
                        <span className="inline-flex items-center gap-1">
                          <Spinner className="h-3 w-3" />
                          Deleting…
                        </span>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
