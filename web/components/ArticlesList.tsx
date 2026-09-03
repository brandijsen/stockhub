"use client";

import { useSearchParams } from "next/navigation";

import { LoadingText } from "@/components/ContentSkeletons";
import { ListFilterBanner } from "@/components/ListFilterBanner";

import { downloadArticlesImportErrorsCsv } from "@/lib/article-excel";

import { ArticlesListFilters } from "./articles-list/ArticlesListFilters";
import { ArticlesListHeader } from "./articles-list/ArticlesListHeader";
import { ListPagination } from "@/components/ListPagination";
import { ArticlesListTable } from "./articles-list/ArticlesListTable";
import { useArticlesList } from "./articles-list/useArticlesList";

type ArticlesListProps = {
  canManage: boolean;
};

export function ArticlesList({ canManage }: ArticlesListProps) {
  const searchParams = useSearchParams();
  const initialLowStockOnly = searchParams.get("lowStock") === "true";
  const initialActiveOnly = searchParams.get("active") === "true";
  const list = useArticlesList({ initialLowStockOnly, initialActiveOnly });
  const initialLoad = list.loading && list.articles.length === 0;
  const refreshing = list.loading && list.articles.length > 0;

  return (
    <div>
      <ArticlesListHeader
        canManage={canManage}
        exporting={list.exporting}
        importing={list.importing}
        importInputRef={list.importInputRef}
        onExport={() => void list.handleExport()}
        onImportFile={(e) => void list.handleImportFile(e)}
      />

      <ArticlesListFilters
        searchInput={list.searchInput}
        categoryId={list.categoryId}
        brandId={list.brandId}
        activeOnly={list.activeOnly}
        lowStockOnly={list.lowStockOnly}
        categories={list.categories}
        brands={list.brands}
        hasFilters={list.hasFilters}
        onSearchInputChange={list.setSearchInput}
        onSearch={(e) => void list.handleSearch(e)}
        onCategoryChange={list.handleCategoryChange}
        onBrandChange={list.handleBrandChange}
        onActiveOnlyChange={list.handleActiveOnlyChange}
        onLowStockOnlyChange={list.handleLowStockOnlyChange}
        onClearFilters={list.clearFilters}
      />

      {initialLowStockOnly || initialActiveOnly ? (
        <ListFilterBanner
          label={
            initialLowStockOnly && initialActiveOnly
              ? "Active low stock articles only"
              : initialLowStockOnly
                ? "Low stock articles only"
                : "Active articles only"
          }
          clearHref="/articles"
        />
      ) : null}

      {list.importSummary ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {list.importSummary}
        </p>
      ) : null}

      {list.importErrors.length > 0 ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">
              {list.importErrors.length} row error
              {list.importErrors.length === 1 ? "" : "s"}
            </p>
            <button
              type="button"
              onClick={() =>
                downloadArticlesImportErrorsCsv(list.importErrors)
              }
              className="text-sm font-medium text-amber-900 underline underline-offset-2 hover:text-amber-950"
            >
              Download CSV
            </button>
          </div>
          <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto font-mono text-xs">
            {list.importErrors.map((entry) => (
              <li key={`${entry.row}-${entry.message}`}>
                Row {entry.row}: {entry.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {list.error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {list.error}
        </p>
      ) : null}

      {initialLoad ? (
        <LoadingText />
      ) : list.total === 0 ? (
        <p className="mt-8 text-zinc-600">
          {list.hasFilters
            ? "No articles match your filters."
            : "No articles yet."}
        </p>
      ) : (
        <div className={refreshing ? "opacity-60" : undefined}>
          <ArticlesListTable
            articles={list.articles}
            canManage={canManage}
            deletingId={list.deletingId}
            onDelete={list.handleDelete}
          />
          <ListPagination
            rangeStart={list.rangeStart}
            rangeEnd={list.rangeEnd}
            total={list.total}
            page={list.page}
            totalPages={list.totalPages}
            loading={list.loading}
            onPrevious={() => list.setPage((p) => Math.max(1, p - 1))}
            onNext={() =>
              list.setPage((p) => Math.min(list.totalPages, p + 1))
            }
          />
        </div>
      )}
    </div>
  );
}
