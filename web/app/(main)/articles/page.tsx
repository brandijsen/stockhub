import { Suspense } from "react";

import { ArticlesList } from "@/components/ArticlesList";
import { Spinner } from "@/components/Spinner";
import { canManageArticles } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function ArticlesPage() {
  const user = await getSession();
  const canManage = canManageArticles(user?.role);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-zinc-600">
            <Spinner label="Loading articles" />
            <span>Loading articles…</span>
          </div>
        }
      >
        <ArticlesList canManage={canManage} />
      </Suspense>
    </div>
  );
}
