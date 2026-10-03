import { loadOrderLineArticles } from "../../lib/order-lines";

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
  const check = await loadOrderLineArticles(
    lines.map((line) => line.articleId),
    (code) => `Article ${code} is inactive and cannot be ordered`,
  );
  if (!check.ok) {
    return check;
  }

  return {
    ok: true,
    articles: check.articles.map(({ id, code, name }) => ({ id, code, name })),
  };
}
