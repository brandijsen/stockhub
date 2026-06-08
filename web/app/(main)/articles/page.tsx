import { ArticlesList } from "@/components/ArticlesList";
import { getSession } from "@/lib/session";
import { canManageArticles } from "@/lib/roles";

export default async function ArticlesPage() {
  const user = await getSession();
  const canManage = canManageArticles(user?.role);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ArticlesList canManage={canManage} />
    </div>
  );
}
