import { prisma } from "./prisma";
import type { AttributeValueInput } from "../routes/articles/schemas";

export type SimpleCustomAttribute = {
  name: string;
  value: string;
};

/** Stable snake_case key from a human-readable attribute name. */
export function attributeKeyFromName(name: string): string {
  let key = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!key || !/^[a-z]/.test(key)) {
    key = `attr_${key || "field"}`;
  }

  return key.slice(0, 64);
}

/**
 * Ensures TEXT definitions exist and returns attribute value rows for the article API.
 */
export async function resolveSimpleCustomAttributes(
  pairs: SimpleCustomAttribute[] | undefined,
): Promise<AttributeValueInput[]> {
  if (!pairs?.length) {
    return [];
  }

  const seenKeys = new Set<string>();
  const result: AttributeValueInput[] = [];

  for (const pair of pairs) {
    const name = pair.name.trim();
    const value = pair.value.trim();
    if (!name || !value) {
      continue;
    }

    const key = attributeKeyFromName(name);
    if (seenKeys.has(key)) {
      throw new Error(`Duplicate attribute: ${name}`);
    }
    seenKeys.add(key);

    let definition = await prisma.attributeDefinition.findUnique({
      where: { key },
    });

    if (!definition) {
      definition = await prisma.attributeDefinition.create({
        data: {
          key,
          label: name,
          type: "TEXT",
          categoryId: null,
        },
      });
    }

    result.push({
      definitionId: definition.id,
      valueText: value,
      valueNumber: null,
      valueBoolean: null,
      optionId: null,
    });
  }

  return result;
}
