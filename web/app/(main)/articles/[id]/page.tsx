import { ArticleDetail } from "@/components/ArticleDetail";
import { PageContainer } from "@/components/PageContainer";
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
    <PageContainer width="detail">
      <ArticleDetail articleId={id} canManage={canManage} />
    </PageContainer>
  );
}
