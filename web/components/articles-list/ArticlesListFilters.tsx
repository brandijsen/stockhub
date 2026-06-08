import type { FormEvent } from "react";

import type { CatalogBrand, CatalogCategory } from "@/lib/articles";

import { articlesListFilterControlClass } from "./filter-styles";

type ArticlesListFiltersProps = {
  searchInput: string;
  categoryId: string;
  brandId: string;
  activeOnly: boolean;
  lowStockOnly: boolean;
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  hasFilters: boolean;
  onSearchInputChange: (value: string) => void;
  onSearch: (e: FormEvent) => void;
  onCategoryChange: (categoryId: string) => void;
  onBrandChange: (brandId: string) => void;
  onActiveOnlyChange: (checked: boolean) => void;
  onLowStockOnlyChange: (checked: boolean) => void;
  onClearFilters: () => void;
};

export function ArticlesListFilters({
  searchInput,
  categoryId,
  brandId,
  activeOnly,
  lowStockOnly,
  categories,
  brands,
  hasFilters,
  onSearchInputChange,
  onSearch,
  onCategoryChange,
  onBrandChange,
  onActiveOnlyChange,
  onLowStockOnlyChange,
  onClearFilters,
}: ArticlesListFiltersProps) {
  return (
    <>
      <form onSubmit={onSearch} className="mt-6 flex max-w-md gap-2">
        <input
          type="search"
          placeholder="Search by code, name, or barcode…"
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          className={`min-w-0 flex-1 ${articlesListFilterControlClass}`}
        />
        <button
          type="submit"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block text-sm text-zinc-700">
          <span className="mb-1 block font-medium">Category</span>
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={`min-w-40 ${articlesListFilterControlClass}`}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-zinc-700">
          <span className="mb-1 block font-medium">Brand</span>
          <select
            value={brandId}
            onChange={(e) => onBrandChange(e.target.value)}
            className={`min-w-40 ${articlesListFilterControlClass}`}
          >
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => onActiveOnlyChange(e.target.checked)}
            className="rounded border-zinc-300"
          />
          Active only
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => onLowStockOnlyChange(e.target.checked)}
            className="rounded border-zinc-300"
          />
          Low stock only
        </label>
        {hasFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </>
  );
}
