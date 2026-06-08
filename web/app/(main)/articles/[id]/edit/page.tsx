import Link from "next/link";
import { redirect } from "next/navigation";

import { ArticleForm } from "@/components/ArticleForm";
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900">Edit article</h1>
      <div className="mt-8">
        <p className="mb-6 text-sm text-zinc-600">
          <Link href={`/articles/${id}`} className="underline hover:text-zinc-900">
            View article
          </Link>
        </p>
        <ArticleForm mode="edit" articleId={id} />
      </div>
    </div>
  );
}
