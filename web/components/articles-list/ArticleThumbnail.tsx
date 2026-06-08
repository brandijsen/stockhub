import { useState } from "react";

import type { Article } from "@/lib/articles";

export function ArticleThumbnail({ article }: { article: Article }) {
  const [failed, setFailed] = useState(false);

  if (!article.imageUrl || failed) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded border border-zinc-200 bg-zinc-100 text-[10px] text-zinc-400">
        —
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={article.imageUrl}
      alt=""
      className="h-10 w-10 rounded border border-zinc-200 object-cover"
      onError={() => setFailed(true)}
    />
  );
}
