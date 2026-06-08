"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Spinner } from "@/components/Spinner";
import {
  type Article,
  articleAttributesForDisplay,
  formatArticleDate,
} from "@/lib/articles";
import { api, apiErrorMessage } from "@/lib/api-client";

type ArticleDetailProps = {
  articleId: string;
  canManage: boolean;
};

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-zinc-100 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-900">{children}</dd>
    </div>
  );
}

export function ArticleDetail({ articleId, canManage }: ArticleDetailProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const { data } = await api.get<{ article: Article }>(
          `/api/articles/${articleId}`,
        );
        if (active) {
          setArticle(data.article);
        }
      } catch (e) {
        if (active) {
          setError(apiErrorMessage(e, "Failed to load article"));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [articleId]);

  async function handleDelete() {
    if (!article || !window.confirm(`Delete article "${article.code}"?`)) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await api.delete(`/api/articles/${article.id}`);
      router.push("/articles");
      router.refresh();
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to delete article"));
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zinc-600">
        <Spinner label="Loading article" />
        <span>Loading article…</span>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div>
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
        <Link
          href="/articles"
          className="mt-4 inline-block text-sm text-zinc-700 underline"
        >
          Back to articles
        </Link>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  const attributes = articleAttributesForDisplay(article);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-zinc-500">{article.code}</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
            {article.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {article.lowStock ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                Low stock
              </span>
            ) : null}
            {!article.isActive ? (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                Inactive
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                Active
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/articles"
            className="inline-flex rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Back to list
          </Link>
          {canManage ? (
            <>
              <Link
                href={`/articles/${article.id}/edit`}
                className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Edit
              </Link>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void handleDelete()}
                className="inline-flex rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,16rem)_1fr]">
        <div>
          {article.imageUrl && !imageFailed ? (
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.imageUrl}
                alt={article.name}
                className="aspect-square w-full object-cover"
                onError={() => setImageFailed(true)}
              />
            </div>
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 text-sm text-zinc-400">
              No image
            </div>
          )}
        </div>

        <dl className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white px-4">
          <DetailRow label="Stock">{article.stock}</DetailRow>
          <DetailRow label="Min threshold">{article.minThreshold}</DetailRow>
          <DetailRow label="Price">
            {article.price != null ? `€ ${article.price.toFixed(2)}` : "—"}
          </DetailRow>
          <DetailRow label="Weight">
            {article.weightGrams != null
              ? `${article.weightGrams} g`
              : "—"}
          </DetailRow>
          <DetailRow label="Category">
            {article.category?.name ?? "—"}
          </DetailRow>
          <DetailRow label="Brand">{article.brand?.name ?? "—"}</DetailRow>
          <DetailRow label="Barcode">
            {article.barcode ? (
              <span className="font-mono">{article.barcode}</span>
            ) : (
              "—"
            )}
          </DetailRow>
          {attributes.map((row) => (
            <DetailRow key={`${row.name}-${row.value}`} label={row.name}>
              {row.value}
            </DetailRow>
          ))}
          <DetailRow label="Description">
            {article.description?.trim() ? (
              <span className="whitespace-pre-wrap">{article.description}</span>
            ) : (
              "—"
            )}
          </DetailRow>
          <DetailRow label="Updated">
            {formatArticleDate(article.updatedAt)}
          </DetailRow>
        </dl>
      </div>
    </div>
  );
}
