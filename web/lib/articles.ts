import { api } from "@/lib/api-client";

export type CatalogBrand = { id: string; name: string };

export const ARTICLES_PAGE_SIZE = 20;

export type ArticlesListResponse = {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ArticleCustomAttribute = {
  name: string;
  value: string;
};

export type ArticleAttributeValue = {
  id: string;
  definitionId: string;
  key: string;
  label: string;
  type: string;
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  option: { id: string; value: string; label: string } | null;
};

export type Article = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  stock: number;
  minThreshold: number;
  lowStock: boolean;
  isActive: boolean;
  barcode: string | null;
  price: number | null;
  weightGrams: number | null;
  imageUrl: string | null;
  brand: CatalogBrand | null;
  category: CatalogCategory | null;
  attributeValues: ArticleAttributeValue[];
  createdAt: string;
  updatedAt: string;
};

export type ArticleFormValues = {
  code: string;
  barcode: string | null;
  name: string;
  description: string;
  stock: number;
  minThreshold: number;
  isActive: boolean;
  price: string;
  weightGrams: string;
  brandId: string;
  categoryId: string;
  customAttributes: ArticleCustomAttribute[];
};

export function emptyArticleForm(): ArticleFormValues {
  return {
    code: "",
    barcode: null,
    name: "",
    description: "",
    stock: 0,
    minThreshold: 0,
    isActive: true,
    price: "",
    weightGrams: "",
    brandId: "",
    categoryId: "",
    customAttributes: [],
  };
}

export function formatArticleAttributeValue(
  value: ArticleAttributeValue,
): string {
  if (value.valueText != null && value.valueText.trim() !== "") {
    return value.valueText;
  }
  if (value.option) {
    return value.option.label ?? value.option.value;
  }
  if (value.valueNumber != null) {
    return String(value.valueNumber);
  }
  if (value.valueBoolean != null) {
    return value.valueBoolean ? "Yes" : "No";
  }
  return "";
}

export function articleAttributesForDisplay(
  article: Article,
): ArticleCustomAttribute[] {
  return article.attributeValues
    .map((value) => ({
      name: value.label || value.key,
      value: formatArticleAttributeValue(value),
    }))
    .filter((row) => row.name && row.value);
}

export function articleToForm(article: Article): ArticleFormValues {
  return {
    code: article.code,
    barcode: article.barcode,
    name: article.name,
    description: article.description ?? "",
    stock: article.stock,
    minThreshold: article.minThreshold,
    isActive: article.isActive,
    price: article.price != null ? String(article.price) : "",
    weightGrams:
      article.weightGrams != null ? String(article.weightGrams) : "",
    brandId: article.brand?.id ?? "",
    categoryId: article.category?.id ?? "",
    customAttributes: articleAttributesForDisplay(article),
  };
}

export function formToPayload(values: ArticleFormValues) {
  const customAttributes = values.customAttributes
    .map((row) => ({
      name: row.name.trim(),
      value: row.value.trim(),
    }))
    .filter((row) => row.name && row.value);

  return {
    name: values.name.trim(),
    description: values.description.trim() || null,
    stock: values.stock,
    minThreshold: values.minThreshold,
    isActive: values.isActive,
    price: values.price.trim() !== "" ? Number(values.price) : null,
    weightGrams:
      values.weightGrams.trim() !== "" ? Number(values.weightGrams) : null,
    brandId: values.brandId || null,
    categoryId: values.categoryId || null,
    customAttributes,
  };
}

export function emptyCustomAttributeRow(): ArticleCustomAttribute {
  return { name: "", value: "" };
}

export function formatArticleDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function fetchArticles(params: {
  page?: number;
  limit?: number;
  active?: boolean;
}): Promise<ArticlesListResponse> {
  const { data } = await api.get<ArticlesListResponse>("/api/articles", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? ARTICLES_PAGE_SIZE,
      ...(params.active ? { active: "true" } : {}),
    },
  });
  return data;
}

export async function adjustArticleStock(
  articleId: string,
  payload: { delta: number; note?: string | null },
): Promise<Article> {
  const { data } = await api.post<{ article: Article }>(
    `/api/articles/${articleId}/adjust-stock`,
    payload,
  );
  return data.article;
}
