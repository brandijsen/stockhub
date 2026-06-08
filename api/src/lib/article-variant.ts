import { prisma } from "./prisma";
import {
  generateBarcodeFromVariant,
  type VariantFingerprintInput,
} from "./article-barcode";

export async function findArticleByVariantBarcode(
  fingerprint: VariantFingerprintInput,
  excludeArticleId?: string,
) {
  const barcode = generateBarcodeFromVariant(fingerprint);
  const existing = await prisma.article.findFirst({
    where: {
      barcode,
      ...(excludeArticleId ? { NOT: { id: excludeArticleId } } : {}),
    },
    select: { id: true, code: true },
  });
  return { barcode, existing };
}

export async function attributeValuesFromArticleId(
  articleId: string,
): Promise<VariantFingerprintInput["attributeValues"]> {
  const rows = await prisma.attributeValue.findMany({
    where: { articleId },
    select: {
      definitionId: true,
      valueText: true,
      valueNumber: true,
      valueBoolean: true,
      optionId: true,
    },
  });

  return rows.map((row) => ({
    definitionId: row.definitionId,
    valueText: row.valueText,
    valueNumber: row.valueNumber?.toNumber() ?? null,
    valueBoolean: row.valueBoolean,
    optionId: row.optionId,
  }));
}
