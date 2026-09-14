import Link from "next/link";
import { redirect } from "next/navigation";

import { ArticleForm } from "@/components/ArticleForm";
import { PageContainer, pageTitleClassName } from "@/components/PageContainer";
import { getSession } from "@/lib/session";
import { canManageArticles } from "@/lib/roles";

type EditArticlePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const user = await getSession();
  if (!canManageArticles(user?.role)) {
    redirect("/articles");
  }

  const { id } = await params;

  return (
    <PageContainer width="narrow">
      <h1 className={pageTitleClassName}>Edit article</h1>
      <div className="mt-8">
        <p className="mb-6 text-sm text-zinc-600">
          <Link href={`/articles/${id}`} className="underline hover:text-zinc-900">
            View article
          </Link>
        </p>
        <ArticleForm mode="edit" articleId={id} />
      </div>
    </PageContainer>
  );
}
