import { redirect } from "next/navigation";

import { ArticleForm } from "@/components/ArticleForm";
import { getSession } from "@/lib/session";
import { canManageArticles } from "@/lib/roles";

export default async function NewArticlePage() {
  const user = await getSession();
  if (!canManageArticles(user?.role)) {
    redirect("/articles");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900">New article</h1>
      <p className="mt-1 text-zinc-600">
        Fixed fields plus custom attributes for this category.
      </p>
      <div className="mt-8">
        <ArticleForm mode="create" />
      </div>
    </div>
  );
}
