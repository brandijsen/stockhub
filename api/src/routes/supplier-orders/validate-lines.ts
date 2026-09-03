import { prisma } from "../../lib/prisma";

export type OrderLineInput = {
  articleId: string;
  qtyOrdered: number;
};

export async function validateSupplierOrderLines(
  lines: OrderLineInput[],
): Promise<
  | { ok: true; articles: { id: string; code: string; name: string }[] }
  | { ok: false; error: string }
> {
  const articleIds = lines.map((line) => line.articleId);
  const articles = await prisma.article.findMany({
    where: { id: { in: articleIds } },
    select: { id: true, code: true, name: true, isActive: true },
  });

  if (articles.length !== articleIds.length) {
    return { ok: false, error: "One or more articles were not found" };
  }

  const inactive = articles.find((article) => !article.isActive);
  if (inactive) {
    return {
      ok: false,
      error: `Article ${inactive.code} is inactive and cannot be ordered`,
    };
  }

  return { ok: true, articles };
}
