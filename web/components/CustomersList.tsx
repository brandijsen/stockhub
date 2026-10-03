"use client";

import { PartyList, type PartyListCopy } from "@/components/party-list/PartyList";
import {
  createCustomer,
  customerToFormValues,
  deleteCustomer,
  emptyCustomerForm,
  fetchCustomers,
  updateCustomer,
} from "@/lib/customers";

const copy: PartyListCopy = {
  title: "Customers",
  description: "Customer contacts for sales orders.",
  manageHint: " Admins can add and edit customers.",
  viewHint: " You can view the list; only admins can make changes.",
  addLabel: "Add customer",
  emptyLabel: "No customers yet.",
  emptyManageHint: " Add your first customer to get started.",
  newTitle: "New customer",
  editTitle: "Edit customer",
  createLabel: "Create customer",
  idPrefix: "customer",
  createError: "Failed to create customer",
  updateError: "Failed to update customer",
  deleteBlocked: "This customer has orders and cannot be deleted.",
  deleteConfirm: (name) =>
    `Delete customer "${name}"? This cannot be undone.`,
  deleteError: "Failed to delete customer",
};

type CustomersListProps = {
  canManage: boolean;
};

export function CustomersList({ canManage }: CustomersListProps) {
  return (
    <PartyList
      canManage={canManage}
      loadItems={fetchCustomers}
      loadErrorMessage="Failed to load customers"
      emptyForm={emptyCustomerForm}
      toFormValues={customerToFormValues}
      createItem={createCustomer}
      updateItem={updateCustomer}
      deleteItem={deleteCustomer}
      copy={copy}
    />
  );
}
