import axios from "axios";

/** Browser calls same-origin `/api/*`; Next rewrites to Express. */
export const api = axios.create({
  withCredentials: true,
});

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    if (data?.error) {
      return data.error;
    }
  }
  return fallback;
}
