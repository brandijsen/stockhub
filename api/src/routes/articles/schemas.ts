import { z } from "zod";

export const customAttributeSchema = z.object({
  name: z.string().trim().min(1).max(128),
  value: z.string().trim().min(1).max(10000),
});

/** Internal shape after resolving customAttributes (not accepted on the public API). */
export type AttributeValueInput = {
  definitionId: string;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
  optionId?: string | null;
};

export const createArticleSchema = z.object({
  name: z.string().trim().min(1).max(256),
  description: z.string().max(10000).optional().nullable(),
  stock: z.number().int().min(0).default(0),
  minThreshold: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  price: z.number().min(0).optional().nullable(),
  weightGrams: z.number().int().min(0).optional().nullable(),
  brandId: z.string().min(1).optional().nullable(),
  categoryId: z.string().min(1).optional().nullable(),
  customAttributes: z.array(customAttributeSchema).optional(),
}).strict();

export const updateArticleSchema = createArticleSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const ARTICLES_LIST_DEFAULT_LIMIT = 20;
export const ARTICLES_LIST_MAX_LIMIT = 100;

export const listArticlesQuerySchema = z.object({
  q: z.string().trim().optional(),
  categoryId: z.string().min(1).optional(),
  brandId: z.string().min(1).optional(),
  active: z.enum(["true"]).optional(),
  lowStock: z.enum(["true"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(ARTICLES_LIST_MAX_LIMIT)
    .default(ARTICLES_LIST_DEFAULT_LIMIT),
});

export const exportArticlesQuerySchema = listArticlesQuerySchema.omit({
  page: true,
  limit: true,
});

export const ARTICLES_EXPORT_MAX_ROWS = 5000;
export const ARTICLES_IMPORT_MAX_ROWS = 1000;
export type CustomAttributeInput = z.infer<typeof customAttributeSchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
