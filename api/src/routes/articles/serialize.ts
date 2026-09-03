import type {
  Article,
  AttributeDefinition,
  AttributeOption,
  AttributeValue,
  Brand,
  Category,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

import { articleImagePublicPath } from "../../lib/article-image";

type ArticleWithRelations = Article & {
  brand: Brand | null;
  category: Category | null;
  attributeValues: (AttributeValue & {
    definition: AttributeDefinition;
    option: AttributeOption | null;
  })[];
};

function decimalToNumber(value: Decimal | null): number | null {
  if (value === null) {
    return null;
  }
  return value.toNumber();
}

export function serializeArticle(article: ArticleWithRelations) {
  return {
    id: article.id,
    code: article.code,
    name: article.name,
    description: article.description,
    stock: article.stock,
    minThreshold: article.minThreshold,
    lowStock: article.stock < article.minThreshold,
    isActive: article.isActive,
    barcode: article.barcode,
    price: decimalToNumber(article.price),
    weightGrams: article.weightGrams,
    imageUrl: article.imageUrl
      ? articleImagePublicPath(article.id)
      : null,
    brand: article.brand
      ? { id: article.brand.id, name: article.brand.name }
      : null,
    category: article.category
      ? {
          id: article.category.id,
          name: article.category.name,
          slug: article.category.slug,
        }
      : null,
    attributeValues: article.attributeValues.map((value) => ({
      id: value.id,
      definitionId: value.definitionId,
      key: value.definition.key,
      label: value.definition.label,
      type: value.definition.type,
      valueText: value.valueText,
      valueNumber: decimalToNumber(value.valueNumber),
      valueBoolean: value.valueBoolean,
      option: value.option
        ? {
            id: value.option.id,
            value: value.option.value,
            label: value.option.label ?? value.option.value,
          }
        : null,
    })),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

type ArticleListWithRelations = Article & {
  brand: Pick<Brand, "id" | "name"> | null;
  category: Pick<Category, "id" | "name"> | null;
};

export type SerializedArticleListItem = {
  id: string;
  code: string;
  name: string;
  stock: number;
  minThreshold: number;
  lowStock: boolean;
  isActive: boolean;
  price: number | null;
  imageUrl: string | null;
  brand: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
};

export const articleListInclude = {
  brand: {
    select: {
      id: true,
      name: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

export function serializeArticleListItem(
  article: ArticleListWithRelations,
): SerializedArticleListItem {
  return {
    id: article.id,
    code: article.code,
    name: article.name,
    stock: article.stock,
    minThreshold: article.minThreshold,
    lowStock: article.stock < article.minThreshold,
    isActive: article.isActive,
    price: decimalToNumber(article.price),
    imageUrl: article.imageUrl
      ? articleImagePublicPath(article.id)
      : null,
    brand: article.brand
      ? { id: article.brand.id, name: article.brand.name }
      : null,
    category: article.category
      ? { id: article.category.id, name: article.category.name }
      : null,
  };
}

export const articleInclude = {
  brand: true,
  category: true,
  attributeValues: {
    include: {
      definition: true,
      option: true,
    },
    orderBy: {
      definition: { sortOrder: "asc" as const },
    },
  },
} as const;
