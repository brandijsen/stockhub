import { prisma } from "./prisma";

const CODE_PREFIX = "ART-";
const CODE_PAD = 6;
const CODE_PATTERN = /^ART-(\d+)$/;

/**
 * Sequential internal SKU: ART-000001, ART-000002, …
 * Retries if a gap collision occurs (e.g. manual imports).
 */
export async function generateUniqueArticleCode(): Promise<string> {
  const latest = await prisma.article.findFirst({
    where: { code: { startsWith: CODE_PREFIX } },
    orderBy: { code: "desc" },
    select: { code: true },
  });

  let next = 1;
  const match = latest?.code ? CODE_PATTERN.exec(latest.code) : null;
  if (match) {
    next = Number.parseInt(match[1], 10) + 1;
  }

  for (let offset = 0; offset < 100; offset += 1) {
    const code = `${CODE_PREFIX}${String(next + offset).padStart(CODE_PAD, "0")}`;
    const taken = await prisma.article.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!taken) {
      return code;
    }
  }

  throw new Error("Could not generate a unique article code");
}
