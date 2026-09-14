import { redirect } from "next/navigation";

import { ArticleForm } from "@/components/ArticleForm";
import { PageContainer, pageTitleClassName } from "@/components/PageContainer";
import { getSession } from "@/lib/session";
import { canManageArticles } from "@/lib/roles";

export default async function NewArticlePage() {
  const user = await getSession();
  if (!canManageArticles(user?.role)) {
    redirect("/articles");
  }

  return (
    <PageContainer width="narrow">
      <h1 className={pageTitleClassName}>New article</h1>
      <p className="mt-1 text-zinc-600">
        Fixed fields plus custom attributes for this category.
      </p>
      <div className="mt-8">
        <ArticleForm mode="create" />
      </div>
    </PageContainer>
  );
}
