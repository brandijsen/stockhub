"use client";

import { Spinner } from "@/components/Spinner";
import { apiErrorMessage } from "@/lib/api-client";
import { deleteCustomer, type Customer } from "@/lib/customers";

type CustomersListTableProps = {
  customers: Customer[];
  canManage: boolean;
  deletingId: string | null;
  onEdit: (customer: Customer) => void;
  onDeleteStart: (id: string) => void;
  onDeleteEnd: () => void;
  onDeleted: (id: string) => void;
  onDeleteError: (message: string) => void;
};

export function CustomersListTable({
  customers,
  canManage,
  deletingId,
  onEdit,
  onDeleteStart,
  onDeleteEnd,
  onDeleted,
  onDeleteError,
}: CustomersListTableProps) {
  async function handleDelete(customer: Customer) {
    if (customer.orderCount > 0) {
      onDeleteError("This customer has orders and cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Delete customer "${customer.name}"? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    onDeleteStart(customer.id);
    try {
      await deleteCustomer(customer.id);
      onDeleted(customer.id);
    } catch (e) {
      onDeleteError(apiErrorMessage(e, "Failed to delete customer"));
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
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-zinc-50/80">
              <td className="px-3 py-2 font-medium text-zinc-900">
                {customer.name}
              </td>
              <td className="px-3 py-2 text-zinc-600">{customer.email ?? "—"}</td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                {customer.phone ?? "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                {customer.orderCount}
              </td>
              {canManage ? (
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(customer)}
                      className="text-sm font-medium text-sky-700 hover:text-sky-900"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === customer.id}
                      onClick={() => void handleDelete(customer)}
                      className="text-sm font-medium text-red-700 hover:text-red-900 disabled:opacity-50"
                    >
                      {deletingId === customer.id ? (
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
