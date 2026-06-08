import type { ChangeEvent } from "react";

import { ArticleFormField } from "./ArticleFormField";

type ArticleFormImageSectionProps = {
  mode: "create" | "edit";
  imagePreview: string | null;
  existingImageUrl: string | null;
  imageFile: File | null;
  removingImage: boolean;
  onImagePick: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearPending: () => void;
  onRemoveExisting: () => void;
};

export function ArticleFormImageSection({
  mode,
  imagePreview,
  existingImageUrl,
  imageFile,
  removingImage,
  onImagePick,
  onClearPending,
  onRemoveExisting,
}: ArticleFormImageSectionProps) {
  return (
    <ArticleFormField label="Product image" className="sm:col-span-2">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onImagePick}
        className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-lg file:border file:border-zinc-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-800 hover:file:bg-zinc-50"
      />
      <p className="mt-1 text-xs text-zinc-500">
        JPEG, PNG or WebP — max 5 MB.
      </p>
      {imagePreview || existingImageUrl ? (
        <div className="mt-3 flex flex-wrap items-start gap-3">
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview ?? existingImageUrl ?? ""}
              alt="Product preview"
              className="aspect-[4/3] w-full max-w-xs object-cover"
            />
          </div>
          <div className="flex flex-col gap-2">
            {imageFile ? (
              <button
                type="button"
                onClick={onClearPending}
                className="text-sm text-zinc-600 underline hover:text-zinc-900"
              >
                Clear selected file
              </button>
            ) : null}
            {mode === "edit" && existingImageUrl && !imageFile ? (
              <button
                type="button"
                disabled={removingImage}
                onClick={onRemoveExisting}
                className="text-sm text-red-700 underline hover:text-red-900 disabled:opacity-50"
              >
                {removingImage ? "Removing…" : "Remove image"}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </ArticleFormField>
  );
}
