import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import type { AttributeValueInput } from "./schemas";

function hasProvidedValue(input: AttributeValueInput): boolean {
  return (
    input.valueText != null ||
    input.valueNumber != null ||
    input.valueBoolean != null ||
    input.optionId != null
  );
}

function toCreateRows(
  inputs: AttributeValueInput[],
): Prisma.AttributeValueCreateWithoutArticleInput[] {
  return inputs
    .filter(hasProvidedValue)
    .map((input) => ({
      definition: { connect: { id: input.definitionId } },
      valueText: input.valueText ?? null,
      valueNumber: input.valueNumber ?? null,
      valueBoolean: input.valueBoolean ?? null,
      option: input.optionId
        ? { connect: { id: input.optionId } }
        : undefined,
    }));
}

export async function replaceArticleAttributeValues(
  articleId: string,
  inputs: AttributeValueInput[],
): Promise<void> {
  await prisma.$transaction([
    prisma.attributeValue.deleteMany({ where: { articleId } }),
    ...toCreateRows(inputs).map((data) =>
      prisma.attributeValue.create({
        data: {
          article: { connect: { id: articleId } },
          ...data,
        },
      }),
    ),
  ]);
}
