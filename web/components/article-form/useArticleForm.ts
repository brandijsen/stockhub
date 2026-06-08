import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";

import {
  removeArticleImage,
  uploadArticleImageFile,
} from "@/lib/article-image";
import {
  type Article,
  type ArticleFormValues,
  type CatalogBrand,
  type CatalogCategory,
  articleToForm,
  emptyArticleForm,
  formToPayload,
} from "@/lib/articles";
import { api, apiErrorMessage } from "@/lib/api-client";

type UseArticleFormOptions = {
  mode: "create" | "edit";
  articleId?: string;
};

export function useArticleForm({ mode, articleId }: UseArticleFormOptions) {
  const [values, setValues] = useState<ArticleFormValues>(emptyArticleForm());
  const [brands, setBrands] = useState<CatalogBrand[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [removingImage, setRemovingImage] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [addingBrand, setAddingBrand] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          api.get<{ brands: CatalogBrand[] }>("/api/catalog/brands"),
          api.get<{ categories: CatalogCategory[] }>(
            "/api/catalog/categories",
          ),
        ]);
        setBrands(brandsRes.data.brands);
        setCategories(categoriesRes.data.categories);
      } catch (e) {
        setError(apiErrorMessage(e, "Failed to load catalog data"));
      }
    }

    void loadCatalog();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (mode !== "edit" || !articleId) {
      return;
    }

    async function loadArticle() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<{ article: Article }>(
          `/api/articles/${articleId}`,
        );
        const form = articleToForm(data.article);
        setValues(form);
        setExistingImageUrl(data.article.imageUrl);
        setImageFile(null);
        setImagePreview(null);
      } catch (e) {
        setError(apiErrorMessage(e, "Failed to load article"));
      } finally {
        setLoading(false);
      }
    }

    void loadArticle();
  }, [articleId, mode]);

  function updateField<K extends keyof ArticleFormValues>(
    key: K,
    value: ArticleFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleCategoryChange(categoryId: string) {
    updateField("categoryId", categoryId);
  }

  function categoryNameToSlug(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);
  }

  function handleImagePick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearPendingImage() {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleAddBrand() {
    const name = newBrandName.trim();
    if (!name) {
      return;
    }
    setAddingBrand(true);
    setError(null);
    try {
      const { data } = await api.post<{ brand: CatalogBrand }>(
        "/api/catalog/brands",
        { name },
      );
      setBrands((prev) =>
        [...prev, data.brand].sort((a, b) => a.name.localeCompare(b.name)),
      );
      updateField("brandId", data.brand.id);
      setNewBrandName("");
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to create brand"));
    } finally {
      setAddingBrand(false);
    }
  }

  async function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) {
      return;
    }
    const slug = categoryNameToSlug(name);
    if (!slug) {
      setError("Category name must contain letters or numbers");
      return;
    }
    setAddingCategory(true);
    setError(null);
    try {
      const { data } = await api.post<{ category: CatalogCategory }>(
        "/api/catalog/categories",
        { name, slug },
      );
      setCategories((prev) =>
        [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)),
      );
      updateField("categoryId", data.category.id);
      setNewCategoryName("");
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to create category"));
    } finally {
      setAddingCategory(false);
    }
  }

  async function handleRemoveExistingImage() {
    if (!articleId || !existingImageUrl) {
      return;
    }
    setRemovingImage(true);
    setError(null);
    try {
      await removeArticleImage(articleId);
      setExistingImageUrl(null);
      clearPendingImage();
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to remove image"));
    } finally {
      setRemovingImage(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = formToPayload(values);

    try {
      if (mode === "create") {
        const { data } = await api.post<{ article: Article }>(
          "/api/articles",
          payload,
        );
        let article = data.article;
        if (imageFile) {
          article = await uploadArticleImageFile(article.id, imageFile);
        }
        setSuccess("Article created.");
        setValues(emptyArticleForm());
        clearPendingImage();
        setExistingImageUrl(null);
      } else if (articleId) {
        await api.patch(`/api/articles/${articleId}`, payload);
        let article: Article;
        if (imageFile) {
          article = await uploadArticleImageFile(articleId, imageFile);
        } else {
          const { data } = await api.get<{ article: Article }>(
            `/api/articles/${articleId}`,
          );
          article = data.article;
        }
        setValues(articleToForm(article));
        setExistingImageUrl(article.imageUrl);
        clearPendingImage();
        setSuccess("Article updated.");
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to save article"));
    } finally {
      setSaving(false);
    }
  }

  return {
    values,
    brands,
    categories,
    newBrandName,
    addingBrand,
    newCategoryName,
    addingCategory,
    loading,
    saving,
    error,
    success,
    imageFile,
    imagePreview,
    existingImageUrl,
    removingImage,
    updateField,
    handleCategoryChange,
    handleAddBrand: () => void handleAddBrand(),
    setNewBrandName,
    handleAddCategory: () => void handleAddCategory(),
    setNewCategoryName,
    handleImagePick,
    clearPendingImage,
    handleRemoveExistingImage: () => void handleRemoveExistingImage(),
    handleSubmit,
  };
}
