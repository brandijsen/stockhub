"use client";

import { PartyList, type PartyListCopy } from "@/components/party-list/PartyList";
import {
  createSupplier,
  deleteSupplier,
  emptySupplierForm,
  fetchSuppliers,
  supplierToFormValues,
  updateSupplier,
} from "@/lib/suppliers";

const copy: PartyListCopy = {
  title: "Suppliers",
  description: "Supplier contacts for purchase orders.",
  manageHint: " Admins can add and edit suppliers.",
  viewHint: " You can view the list; only admins can make changes.",
  addLabel: "Add supplier",
  emptyLabel: "No suppliers yet.",
  emptyManageHint: " Add your first supplier to get started.",
  newTitle: "New supplier",
  editTitle: "Edit supplier",
  createLabel: "Create supplier",
  idPrefix: "supplier",
  createError: "Failed to create supplier",
  updateError: "Failed to update supplier",
  deleteBlocked: "This supplier has purchase orders and cannot be deleted.",
  deleteConfirm: (name) =>
    `Delete supplier "${name}"? This cannot be undone.`,
  deleteError: "Failed to delete supplier",
};

type SuppliersListProps = {
  canManage: boolean;
};

export function SuppliersList({ canManage }: SuppliersListProps) {
  return (
    <PartyList
      canManage={canManage}
      loadItems={fetchSuppliers}
      loadErrorMessage="Failed to load suppliers"
      emptyForm={emptySupplierForm}
      toFormValues={supplierToFormValues}
      createItem={createSupplier}
      updateItem={updateSupplier}
      deleteItem={deleteSupplier}
      copy={copy}
    />
  );
}
