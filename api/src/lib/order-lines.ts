import { prisma } from "./prisma";

export type OrderLineArticle = {
  id: string;
  code: string;
  name: string;
  stock: number;
};

export async function loadOrderLineArticles(
  articleIds: string[],
  inactiveMessage: (code: string) => string,
): Promise<
  | { ok: true; articles: OrderLineArticle[] }
  | { ok: false; error: string }
> {
  if (new Set(articleIds).size !== articleIds.length) {
    return {
      ok: false,
      error: "Each article can appear only once in the order.",
    };
  }

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
    return { ok: false, error: inactiveMessage(inactive.code) };
  }

  return {
    ok: true,
    articles: articles.map(({ id, code, name, stock }) => ({
      id,
      code,
      name,
      stock,
    })),
  };
}
