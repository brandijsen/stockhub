"use client";

import Link from "next/link";

import { LoadingText } from "@/components/ContentSkeletons";
import { Spinner } from "@/components/Spinner";

import { ArticleFormCoreFields } from "./article-form/ArticleFormCoreFields";
import { useArticleForm } from "./article-form/useArticleForm";

type ArticleFormProps = {
  mode: "create" | "edit";
  articleId?: string;
};

export function ArticleForm({ mode, articleId }: ArticleFormProps) {
  const form = useArticleForm({ mode, articleId });

  if (form.loading) {
    return <LoadingText className="mt-6" />;
  }

  return (
    <form onSubmit={form.handleSubmit} className="space-y-8">
      {form.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {form.error}
        </p>
      ) : null}
      {form.success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {form.success}
        </p>
      ) : null}

      <ArticleFormCoreFields
        mode={mode}
        values={form.values}
        brands={form.brands}
        categories={form.categories}
        newBrandName={form.newBrandName}
        addingBrand={form.addingBrand}
        onAddBrand={form.handleAddBrand}
        onNewBrandNameChange={form.setNewBrandName}
        newCategoryName={form.newCategoryName}
        addingCategory={form.addingCategory}
        onAddCategory={form.handleAddCategory}
        onNewCategoryNameChange={form.setNewCategoryName}
        imagePreview={form.imagePreview}
        existingImageUrl={form.existingImageUrl}
        imageFile={form.imageFile}
        removingImage={form.removingImage}
        onUpdateField={form.updateField}
        onCategoryChange={form.handleCategoryChange}
        onImagePick={form.handleImagePick}
        onClearPendingImage={form.clearPendingImage}
        onRemoveExistingImage={form.handleRemoveExistingImage}
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={form.saving}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {form.saving ? <Spinner className="h-4 w-4" label="Saving" /> : null}
          {mode === "create" ? "Create article" : "Save changes"}
        </button>
        <Link
          href="/articles"
          className="inline-flex rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Back to list
        </Link>
      </div>
    </form>
  );
}
