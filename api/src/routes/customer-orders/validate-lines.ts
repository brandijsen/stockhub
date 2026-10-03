import { loadOrderLineArticles } from "../../lib/order-lines";

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
  const check = await loadOrderLineArticles(
    lines.map((line) => line.articleId),
    (code) => `Article ${code} is inactive and cannot be sold`,
  );
  if (!check.ok) {
    return check;
  }

  const byId = new Map(check.articles.map((article) => [article.id, article]));
  for (const line of lines) {
    const article = byId.get(line.articleId)!;
    if (article.stock < line.quantity) {
      return {
        ok: false,
        error: `Insufficient stock for ${article.code} (available ${article.stock}, requested ${line.quantity})`,
      };
    }
  }

  return { ok: true, articles: check.articles };
}
