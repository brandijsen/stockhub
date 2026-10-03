"use client";

import { Spinner } from "@/components/Spinner";
import { apiErrorMessage } from "@/lib/api-client";

import type { PartyListCopy, PartyRecord } from "./types";

type PartyTableProps<T extends PartyRecord> = {
  items: T[];
  canManage: boolean;
  deletingId: string | null;
  deleteItem: (id: string) => Promise<void>;
  copy: PartyListCopy;
  onEdit: (item: T) => void;
  onDeleteStart: (id: string) => void;
  onDeleteEnd: () => void;
  onDeleted: (id: string) => void;
  onDeleteError: (message: string) => void;
};

export function PartyTable<T extends PartyRecord>({
  items,
  canManage,
  deletingId,
  deleteItem,
  copy,
  onEdit,
  onDeleteStart,
  onDeleteEnd,
  onDeleted,
  onDeleteError,
}: PartyTableProps<T>) {
  async function handleDelete(item: T) {
    if (item.orderCount > 0) {
      onDeleteError(copy.deleteBlocked);
      return;
    }

    const confirmed = window.confirm(copy.deleteConfirm(item.name));
    if (!confirmed) {
      return;
    }

    onDeleteStart(item.id);
    try {
      await deleteItem(item.id);
      onDeleted(item.id);
    } catch (e) {
      onDeleteError(apiErrorMessage(e, copy.deleteError));
    } finally {
      onDeleteEnd();
    }
  }

  return (
    <div className="mt-6 max-w-full overflow-x-auto rounded-lg border border-zinc-200">
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
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-zinc-50/80">
              <td className="px-3 py-2 font-medium text-zinc-900">{item.name}</td>
              <td className="px-3 py-2 text-zinc-600">{item.email ?? "—"}</td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                {item.phone ?? "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                {item.orderCount}
              </td>
              {canManage ? (
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="text-sm font-medium text-sky-700 hover:text-sky-900"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => void handleDelete(item)}
                      className="text-sm font-medium text-red-700 hover:text-red-900 disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
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
