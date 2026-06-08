import axios from "axios";

import { api, apiErrorMessage } from "@/lib/api-client";

export type ArticleListExportFilters = {
  q?: string;
  categoryId?: string;
  brandId?: string;
  activeOnly?: boolean;
  lowStockOnly?: boolean;
};

export type ArticlesImportResult = {
  created: number;
  updated: number;
  errors: { row: number; message: string }[];
};

function buildExportParams(
  filters: ArticleListExportFilters,
): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.q) {
    params.q = filters.q;
  }
  if (filters.categoryId) {
    params.categoryId = filters.categoryId;
  }
  if (filters.brandId) {
    params.brandId = filters.brandId;
  }
  if (filters.activeOnly) {
    params.active = "true";
  }
  if (filters.lowStockOnly) {
    params.lowStock = "true";
  }
  return params;
}

export async function downloadArticlesExport(
  filters: ArticleListExportFilters,
): Promise<void> {
  try {
    const response = await api.get<Blob>("/api/articles/export", {
      params: buildExportParams(filters),
      responseType: "blob",
    });

    const disposition = response.headers["content-disposition"];
    const match = disposition?.match(/filename="([^"]+)"/);
    const filename = match?.[1] ?? "articles-export.xlsx";

    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const data = JSON.parse(text) as { error?: string };
        if (data.error) {
          throw new Error(data.error);
        }
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message !== error.message) {
          throw parseError;
        }
      }
    }
    throw new Error(apiErrorMessage(error, "Failed to export articles"));
  }
}

export async function importArticlesExcel(
  file: File,
): Promise<ArticlesImportResult> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<ArticlesImportResult>(
    "/api/articles/import",
    form,
  );
  return data;
}
