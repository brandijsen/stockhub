import axios from "axios";

/** Browser calls same-origin `/api/*`; Next rewrites to Express. */
export const api = axios.create({
  withCredentials: true,
});

type ZodFlattenedError = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[]>;
};

type ApiErrorBody = {
  error?: string;
  details?: ZodFlattenedError;
};

const MAX_VALIDATION_MESSAGES = 3;

const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  name: "Name",
  password: "Password",
  firstName: "First name",
  lastName: "Last name",
  phone: "Phone",
  address: "Address",
  supplierId: "Supplier",
  customerId: "Customer",
  articleId: "Article",
  qtyOrdered: "Quantity ordered",
  quantity: "Quantity",
  currentPassword: "Current password",
  newPassword: "New password",
  adminCloseNote: "Close note",
};

function humanizeFieldName(field: string): string {
  if (FIELD_LABELS[field]) {
    return FIELD_LABELS[field];
  }

  const withSpaces = field
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");

  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function formatValidationDetails(details: ZodFlattenedError): string[] {
  const messages: string[] = [];

  for (const message of details.formErrors ?? []) {
    const trimmed = message.trim();
    if (trimmed) {
      messages.push(trimmed);
    }
  }

  for (const [field, fieldMessages] of Object.entries(details.fieldErrors ?? {})) {
    const label = humanizeFieldName(field);
    for (const message of fieldMessages) {
      const trimmed = message.trim();
      if (trimmed) {
        messages.push(`${label}: ${trimmed}`);
      }
    }
  }

  return messages;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;

    if (data?.details) {
      const validationMessages = formatValidationDetails(data.details);
      if (validationMessages.length > 0) {
        const shown = validationMessages.slice(0, MAX_VALIDATION_MESSAGES);
        const suffix =
          validationMessages.length > shown.length
            ? ` (+${validationMessages.length - shown.length} more)`
            : "";
        return `${shown.join("; ")}${suffix}`;
      }
    }

    if (data?.error) {
      return data.error;
    }
  }

  return fallback;
}
