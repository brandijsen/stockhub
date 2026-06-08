import type { ArticleFormValues, CatalogBrand, CatalogCategory } from "@/lib/articles";

import { ArticleFormBrandField } from "./ArticleFormBrandField";
import { ArticleFormCategoryField } from "./ArticleFormCategoryField";
import { ArticleCustomAttributesSection } from "./ArticleCustomAttributesSection";
import { ArticleFormField } from "./ArticleFormField";
import { ArticleFormImageSection } from "./ArticleFormImageSection";
import { articleFormInputClass } from "./input-styles";

type ArticleFormCoreFieldsProps = {
  mode: "create" | "edit";
  values: ArticleFormValues;
  brands: CatalogBrand[];
  categories: CatalogCategory[];
  newBrandName: string;
  addingBrand: boolean;
  onAddBrand: () => void;
  onNewBrandNameChange: (name: string) => void;
  newCategoryName: string;
  addingCategory: boolean;
  onAddCategory: () => void;
  onNewCategoryNameChange: (name: string) => void;
  imagePreview: string | null;
  existingImageUrl: string | null;
  imageFile: File | null;
  removingImage: boolean;
  onUpdateField: <K extends keyof ArticleFormValues>(
    key: K,
    value: ArticleFormValues[K],
  ) => void;
  onCategoryChange: (categoryId: string) => void;
  onImagePick: React.ChangeEventHandler<HTMLInputElement>;
  onClearPendingImage: () => void;
  onRemoveExistingImage: () => void;
};

export function ArticleFormCoreFields({
  mode,
  values,
  brands,
  categories,
  newBrandName,
  addingBrand,
  onAddBrand,
  onNewBrandNameChange,
  newCategoryName,
  addingCategory,
  onAddCategory,
  onNewCategoryNameChange,
  imagePreview,
  existingImageUrl,
  imageFile,
  removingImage,
  onUpdateField,
  onCategoryChange,
  onImagePick,
  onClearPendingImage,
  onRemoveExistingImage,
}: ArticleFormCoreFieldsProps) {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2">
        {mode === "edit" ? (
          <>
            <ArticleFormField label="Code">
              <input
                readOnly
                value={values.code}
                className={`${articleFormInputClass} bg-zinc-50 text-zinc-600`}
              />
            </ArticleFormField>
            {values.barcode ? (
              <ArticleFormField label="Barcode">
                <input
                  readOnly
                  value={values.barcode}
                  className={`${articleFormInputClass} bg-zinc-50 font-mono text-zinc-600`}
                />
              </ArticleFormField>
            ) : null}
          </>
        ) : null}
        <ArticleFormField label="Name">
          <input
            required
            value={values.name}
            onChange={(e) => onUpdateField("name", e.target.value)}
            className={articleFormInputClass}
          />
        </ArticleFormField>
        <ArticleFormField label="Stock">
          <input
            type="number"
            min={0}
            step={1}
            value={values.stock}
            onChange={(e) =>
              onUpdateField(
                "stock",
                Math.max(0, Number(e.target.value) || 0),
              )
            }
            className={articleFormInputClass}
          />
        </ArticleFormField>
        <ArticleFormField label="Min threshold">
          <input
            type="number"
            min={0}
            value={values.minThreshold}
            onChange={(e) =>
              onUpdateField(
                "minThreshold",
                Math.max(0, Number(e.target.value) || 0),
              )
            }
            className={articleFormInputClass}
          />
        </ArticleFormField>
        <ArticleFormImageSection
          mode={mode}
          imagePreview={imagePreview}
          existingImageUrl={existingImageUrl}
          imageFile={imageFile}
          removingImage={removingImage}
          onImagePick={onImagePick}
          onClearPending={onClearPendingImage}
          onRemoveExisting={onRemoveExistingImage}
        />
        <ArticleFormField label="Price">
          <input
            type="number"
            min={0}
            step="0.01"
            value={values.price}
            onChange={(e) => onUpdateField("price", e.target.value)}
            className={articleFormInputClass}
          />
        </ArticleFormField>
        <ArticleFormField label="Weight (grams)">
          <input
            type="number"
            min={0}
            value={values.weightGrams}
            onChange={(e) => onUpdateField("weightGrams", e.target.value)}
            className={articleFormInputClass}
          />
        </ArticleFormField>
        <ArticleFormBrandField
          brands={brands}
          brandId={values.brandId}
          newBrandName={newBrandName}
          addingBrand={addingBrand}
          onBrandIdChange={(id) => onUpdateField("brandId", id)}
          onNewBrandNameChange={onNewBrandNameChange}
          onAddBrand={onAddBrand}
        />
        <ArticleFormCategoryField
          categories={categories}
          categoryId={values.categoryId}
          newCategoryName={newCategoryName}
          addingCategory={addingCategory}
          onCategoryIdChange={onCategoryChange}
          onNewCategoryNameChange={onNewCategoryNameChange}
          onAddCategory={onAddCategory}
        />
        <label className="flex items-center gap-2 text-sm text-zinc-700 sm:col-span-2">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => onUpdateField("isActive", e.target.checked)}
            className="rounded border-zinc-300"
          />
          Active in catalog
        </label>
        <ArticleFormField label="Description" className="sm:col-span-2">
          <textarea
            rows={3}
            value={values.description}
            onChange={(e) => onUpdateField("description", e.target.value)}
            className={articleFormInputClass}
          />
        </ArticleFormField>
      </section>

      <ArticleCustomAttributesSection
        rows={values.customAttributes}
        onChange={(customAttributes) =>
          onUpdateField("customAttributes", customAttributes)
        }
      />
    </>
  );
}
