import { ArticleFormField } from "./ArticleFormField";
import { articleFormInputClass } from "./input-styles";
import type { CatalogCategory } from "@/lib/articles";

type ArticleFormCategoryFieldProps = {
  categories: CatalogCategory[];
  categoryId: string;
  newCategoryName: string;
  addingCategory: boolean;
  onCategoryIdChange: (categoryId: string) => void;
  onNewCategoryNameChange: (name: string) => void;
  onAddCategory: () => void;
};

export function ArticleFormCategoryField({
  categories,
  categoryId,
  newCategoryName,
  addingCategory,
  onCategoryIdChange,
  onNewCategoryNameChange,
  onAddCategory,
}: ArticleFormCategoryFieldProps) {
  return (
    <ArticleFormField label="Category">
      <select
        value={categoryId}
        onChange={(e) => onCategoryIdChange(e.target.value)}
        className={articleFormInputClass}
      >
        <option value="">— None —</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          value={newCategoryName}
          onChange={(e) => onNewCategoryNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddCategory();
            }
          }}
          placeholder="New category name"
          className={`${articleFormInputClass} min-w-0 flex-1`}
        />
        <button
          type="button"
          onClick={onAddCategory}
          disabled={addingCategory || !newCategoryName.trim()}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
        >
          {addingCategory ? "Adding…" : "Add category"}
        </button>
      </div>
    </ArticleFormField>
  );
}
