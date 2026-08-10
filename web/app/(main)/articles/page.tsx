import { ArticlesList } from "@/components/ArticlesList";
import { canManageArticles } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function ArticlesPage() {
  const user = await getSession();
  const canManage = canManageArticles(user?.role);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ArticlesList canManage={canManage} />
    </div>
  );
}
