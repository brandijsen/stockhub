import { ArticleDetail } from "@/components/ArticleDetail";
import { getSession } from "@/lib/session";
import { canManageArticles } from "@/lib/roles";

type ArticleDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  const { id } = await params;
  const user = await getSession();
  const canManage = canManageArticles(user?.role);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <ArticleDetail articleId={id} canManage={canManage} />
    </div>
  );
}
