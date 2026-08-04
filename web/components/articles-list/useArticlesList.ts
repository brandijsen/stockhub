import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  downloadArticlesExport,
  importArticlesExcel,
} from "@/lib/article-excel";
import {
  ARTICLES_PAGE_SIZE,
  type Article,
  type ArticlesListResponse,
  type CatalogBrand,
  type CatalogCategory,
} from "@/lib/articles";
import { api, apiErrorMessage } from "@/lib/api-client";

import type { ArticleListFilters } from "./types";

type UseArticlesListOptions = {
  initialLowStockOnly?: boolean;
  initialActiveOnly?: boolean;
};

export function useArticlesList(options: UseArticlesListOptions = {}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [brands, setBrands] = useState<CatalogBrand[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [activeOnly, setActiveOnly] = useState(
    options.initialActiveOnly ?? false,
  );
  const [lowStockOnly, setLowStockOnly] = useState(
    options.initialLowStockOnly ?? false,
  );
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const filters: ArticleListFilters = useMemo(
    () => ({
      q: appliedQuery,
      categoryId,
      brandId,
      activeOnly,
      lowStockOnly,
    }),
    [activeOnly, appliedQuery, brandId, categoryId, lowStockOnly],
  );

  const hasFilters =
    appliedQuery !== "" ||
    categoryId !== "" ||
    brandId !== "" ||
    activeOnly ||
    lowStockOnly;

  const loadArticles = useCallback(
    async (targetPage: number, listFilters: ArticleListFilters) => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number> = {
          page: targetPage,
          limit: ARTICLES_PAGE_SIZE,
        };
        if (listFilters.q) {
          params.q = listFilters.q;
        }
        if (listFilters.categoryId) {
          params.categoryId = listFilters.categoryId;
        }
        if (listFilters.brandId) {
          params.brandId = listFilters.brandId;
        }
        if (listFilters.activeOnly) {
          params.active = "true";
        }
        if (listFilters.lowStockOnly) {
          params.lowStock = "true";
        }
        const { data } = await api.get<ArticlesListResponse>("/api/articles", {
          params,
        });
        setArticles(data.articles);
        setPage(data.page);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (e) {
        setError(apiErrorMessage(e, "Failed to load articles"));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void (async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          api.get<{ categories: CatalogCategory[] }>(
            "/api/catalog/categories",
          ),
          api.get<{ brands: CatalogBrand[] }>("/api/catalog/brands"),
        ]);
        setCategories(categoriesRes.data.categories);
        setBrands(brandsRes.data.brands);
      } catch {
        // Filters still work without category names in the dropdown.
      }
    })();
  }, []);

  useEffect(() => {
    void loadArticles(page, filters);
  }, [filters, loadArticles, page]);

  function resetPage() {
    setPage((current) => (current === 1 ? current : 1));
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const query = searchInput.trim();
    setAppliedQuery(query);
    if (page !== 1) {
      setPage(1);
    } else if (
      query === appliedQuery &&
      categoryId === "" &&
      brandId === "" &&
      !activeOnly &&
      !lowStockOnly
    ) {
      await loadArticles(1, { ...filters, q: query });
    }
  }

  function handleCategoryChange(nextCategoryId: string) {
    setCategoryId(nextCategoryId);
    resetPage();
  }

  function handleBrandChange(nextBrandId: string) {
    setBrandId(nextBrandId);
    resetPage();
  }

  function handleActiveOnlyChange(checked: boolean) {
    setActiveOnly(checked);
    resetPage();
  }

  function handleLowStockOnlyChange(checked: boolean) {
    setLowStockOnly(checked);
    resetPage();
  }

  function clearFilters() {
    setSearchInput("");
    setAppliedQuery("");
    setCategoryId("");
    setBrandId("");
    setActiveOnly(false);
    setLowStockOnly(false);
    resetPage();
  }

  async function handleExport() {
    setExporting(true);
    setError(null);
    setImportSummary(null);
    try {
      await downloadArticlesExport({
        q: appliedQuery || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        activeOnly,
        lowStockOnly,
      });
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to export articles"));
    } finally {
      setExporting(false);
    }
  }

  async function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }

    setImporting(true);
    setError(null);
    setImportSummary(null);
    try {
      const result = await importArticlesExcel(file);
      const errorCount = result.errors.length;
      setImportSummary(
        `Import finished: ${result.created} created, ${result.updated} updated${
          errorCount ? `, ${errorCount} row error(s)` : ""
        }.`,
      );
      if (errorCount) {
        setError(
          result.errors
            .slice(0, 5)
            .map((entry) => `Row ${entry.row}: ${entry.message}`)
            .join(" · ") +
            (errorCount > 5 ? ` · …and ${errorCount - 5} more` : ""),
        );
      }
      setPage(1);
      await loadArticles(1, filters);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to import articles"));
    } finally {
      setImporting(false);
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!window.confirm(`Delete article "${code}"?`)) {
      return;
    }
    setDeletingId(id);
    setError(null);
    try {
      await api.delete(`/api/articles/${id}`);
      const nextPage = articles.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await loadArticles(page, filters);
      }
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to delete article"));
    } finally {
      setDeletingId(null);
    }
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * ARTICLES_PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * ARTICLES_PAGE_SIZE, total);

  return {
    articles,
    categories,
    brands,
    searchInput,
    setSearchInput,
    categoryId,
    brandId,
    activeOnly,
    lowStockOnly,
    page,
    setPage,
    total,
    totalPages,
    loading,
    error,
    deletingId,
    exporting,
    importing,
    importSummary,
    importInputRef,
    hasFilters,
    rangeStart,
    rangeEnd,
    handleSearch,
    handleCategoryChange,
    handleBrandChange,
    handleActiveOnlyChange,
    handleLowStockOnlyChange,
    clearFilters,
    handleExport,
    handleImportFile,
    handleDelete,
  };
}
