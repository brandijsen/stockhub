import { prisma } from "../../lib/prisma";

export type CustomerOrderLineInput = {
  articleId: string;
  quantity: number;
};

export async function validateCustomerOrderLines(
  lines: CustomerOrderLineInput[],
): Promise<
  | {
      ok: true;
      articles: {
        id: string;
        code: string;
        name: string;
        stock: number;
      }[];
    }
  | { ok: false; error: string }
> {
  const articleIds = lines.map((line) => line.articleId);
  const articles = await prisma.article.findMany({
    where: { id: { in: articleIds } },
    select: {
      id: true,
      code: true,
      name: true,
      stock: true,
      isActive: true,
    },
  });

  if (articles.length !== articleIds.length) {
    return { ok: false, error: "One or more articles were not found" };
  }

  const inactive = articles.find((article) => !article.isActive);
  if (inactive) {
    return {
      ok: false,
      error: `Article ${inactive.code} is inactive and cannot be sold`,
    };
  }

  const byId = new Map(articles.map((article) => [article.id, article]));
  for (const line of lines) {
    const article = byId.get(line.articleId)!;
    if (article.stock < line.quantity) {
      return {
        ok: false,
        error: `Insufficient stock for ${article.code} (available ${article.stock}, requested ${line.quantity})`,
      };
    }
  }

  return { ok: true, articles };
}
