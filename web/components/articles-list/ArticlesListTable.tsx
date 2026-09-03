import Link from "next/link";

import type { ArticleListItem } from "@/lib/articles";

import { ArticleThumbnail } from "./ArticleThumbnail";

type ArticlesListTableProps = {
  articles: ArticleListItem[];
  canManage: boolean;
  deletingId: string | null;
  onDelete: (id: string, code: string) => void;
};

export function ArticlesListTable({
  articles,
  canManage,
  deletingId,
  onDelete,
}: ArticlesListTableProps) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-600">
          <tr>
            <th className="px-3 py-3 font-medium">Image</th>
            <th className="px-3 py-3 font-medium">Code</th>
            <th className="px-3 py-3 font-medium">Name</th>
            <th className="px-3 py-3 font-medium">Category</th>
            <th className="px-3 py-3 font-medium">Brand</th>
            <th className="px-3 py-3 font-medium">Stock</th>
            <th className="px-3 py-3 font-medium">Price</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {articles.map((article) => (
            <tr key={article.id} className="hover:bg-zinc-50/80">
              <td className="px-3 py-2">
                <ArticleThumbnail article={article} />
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-zinc-900">
                <Link
                  href={`/articles/${article.id}`}
                  className="hover:underline"
                >
                  {article.code}
                </Link>
              </td>
              <td className="px-3 py-2 font-medium text-zinc-900">
                <Link
                  href={`/articles/${article.id}`}
                  className="hover:underline"
                >
                  {article.name}
                </Link>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                {article.category?.name ?? "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                {article.brand?.name ?? "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-900">
                {article.stock}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                {article.price != null ? `€ ${article.price.toFixed(2)}` : "—"}
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {article.lowStock ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                      Low stock
                    </span>
                  ) : null}
                  {!article.isActive ? (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                      Inactive
                    </span>
                  ) : null}
                  {article.isActive && !article.lowStock ? (
                    <span className="text-zinc-400">—</span>
                  ) : null}
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                <div className="flex gap-2">
                  <Link
                    href={`/articles/${article.id}`}
                    className="text-zinc-700 underline hover:text-zinc-900"
                  >
                    View
                  </Link>
                  {canManage ? (
                    <>
                      <Link
                        href={`/articles/${article.id}/edit`}
                        className="text-zinc-700 underline hover:text-zinc-900"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === article.id}
                        onClick={() => void onDelete(article.id, article.code)}
                        className="text-red-700 underline hover:text-red-900 disabled:opacity-50"
                      >
                        {deletingId === article.id ? "…" : "Delete"}
                      </button>
                    </>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
