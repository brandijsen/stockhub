"use client";

import { useSearchParams } from "next/navigation";

import { LoadingText } from "@/components/ContentSkeletons";
import { ListFilterBanner } from "@/components/ListFilterBanner";

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
