import { ArticleFormField } from "./ArticleFormField";
import { articleFormInputClass } from "./input-styles";
import type { CatalogBrand } from "@/lib/articles";

type ArticleFormBrandFieldProps = {
  brands: CatalogBrand[];
  brandId: string;
  newBrandName: string;
  addingBrand: boolean;
  onBrandIdChange: (brandId: string) => void;
  onNewBrandNameChange: (name: string) => void;
  onAddBrand: () => void;
};

export function ArticleFormBrandField({
  brands,
  brandId,
  newBrandName,
  addingBrand,
  onBrandIdChange,
  onNewBrandNameChange,
  onAddBrand,
}: ArticleFormBrandFieldProps) {
  return (
    <ArticleFormField label="Brand" className="sm:col-span-2">
      <select
        value={brandId}
        onChange={(e) => onBrandIdChange(e.target.value)}
        className={articleFormInputClass}
      >
        <option value="">— None —</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          value={newBrandName}
          onChange={(e) => onNewBrandNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddBrand();
            }
          }}
          placeholder="New brand name"
          className={`${articleFormInputClass} min-w-0 flex-1`}
        />
        <button
          type="button"
          onClick={onAddBrand}
          disabled={addingBrand || !newBrandName.trim()}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
        >
          {addingBrand ? "Adding…" : "Add brand"}
        </button>
      </div>
    </ArticleFormField>
  );
}
