import { ArticlesList } from "@/components/ArticlesList";
import { PageContainer } from "@/components/PageContainer";
import { canManageArticles } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function ArticlesPage() {
  const user = await getSession();
  const canManage = canManageArticles(user?.role);

  return (
    <PageContainer width="wide">
      <ArticlesList canManage={canManage} />
    </PageContainer>
  );
}
