import { api } from "./api-client";
import type { Article } from "./articles";

export async function uploadArticleImageFile(
  articleId: string,
  file: File,
): Promise<Article> {
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.post<{ article: Article }>(
    `/api/articles/${articleId}/image`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.article;
}

export async function removeArticleImage(articleId: string): Promise<void> {
  await api.delete(`/api/articles/${articleId}/image`);
}
