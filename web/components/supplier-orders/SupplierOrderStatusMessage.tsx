import type { SupplierOrder } from "@/lib/supplier-orders";

type SupplierOrderStatusMessageProps = {
  order: SupplierOrder;
  canEditPending: boolean;
  canManage: boolean;
};

function appendCloseNote(message: string, note: string | null): string {
  if (!note) {
    return message;
  }
  return `${message} Note: ${note}`;
}

export function SupplierOrderStatusMessage({
  order,
  canEditPending,
  canManage,
}: SupplierOrderStatusMessageProps) {
  let message: string | null = null;

  switch (order.status) {
    case "PENDING":
      message =
        "This order is waiting for delivery. Any team member can declare arrival when goods reach the warehouse." +
        (canEditPending ? " Admins can still edit or cancel until then." : "");
      break;
    case "CHECKED":
      if (!canManage) {
        message =
          "Checking is complete. An admin will close this order as succeeded or done with issues.";
      }
      break;
    case "SUCCEEDED":
      message = appendCloseNote(
        "Order closed successfully. Stock was loaded from the received quantities.",
        order.adminCloseNote,
      );
      break;
    case "DONE":
      message = appendCloseNote(
        "Order closed with reported issues. Stock was not loaded automatically.",
        order.adminCloseNote,
      );
      break;
    default:
      message = null;
  }

  if (!message) {
    return null;
  }

  return <p className="mt-6 text-sm text-zinc-600">{message}</p>;
}
