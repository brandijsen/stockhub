import { createHash } from "node:crypto";

import type { AttributeValueInput } from "../routes/articles/schemas";

/** Internal EAN-13-style barcode (prefix 29 = restricted / internal). */
const INTERNAL_EAN_PREFIX = "29";

export type VariantFingerprintInput = {
  name: string;
  brandId: string | null;
  categoryId: string | null;
  attributeValues: AttributeValueInput[];
};

function canonicalAttributeValues(values: AttributeValueInput[]) {
  return values
    .filter(
      (v) =>
        v.valueText != null ||
        v.valueNumber != null ||
        v.valueBoolean != null ||
        v.optionId != null,
    )
    .map((v) => ({
      definitionId: v.definitionId,
      optionId: v.optionId ?? null,
      valueBoolean: v.valueBoolean ?? null,
      valueNumber: v.valueNumber ?? null,
      valueText: v.valueText?.trim() ?? null,
    }))
    .sort((a, b) => a.definitionId.localeCompare(b.definitionId));
}

function ean13CheckDigit(digits12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    const d = Number(digits12[i]);
    sum += i % 2 === 0 ? d : d * 3;
  }
  return String((10 - (sum % 10)) % 10);
}

/**
 * Deterministic barcode from catalog variant fields (name, brand, category, custom attrs).
 * Same variant fingerprint → same barcode (duplicate variants get 409 on create).
 */
export function generateBarcodeFromVariant(
  input: VariantFingerprintInput,
): string {
  const canonical = JSON.stringify({
    name: input.name.trim().toLowerCase(),
    brandId: input.brandId,
    categoryId: input.categoryId,
    attributeValues: canonicalAttributeValues(input.attributeValues),
  });

  const hash = createHash("sha256").update(canonical).digest("hex");
  const numeric = hash
    .split("")
    .map((char) => Number.parseInt(char, 16))
    .join("")
    .slice(0, 10)
    .padEnd(10, "0");

  const digits12 = `${INTERNAL_EAN_PREFIX}${numeric}`;
  return digits12 + ean13CheckDigit(digits12);
}
