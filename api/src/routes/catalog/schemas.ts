import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().trim().min(1).max(128),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(128),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
});
