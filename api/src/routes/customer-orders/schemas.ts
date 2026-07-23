import { z } from "zod";

const customerOrderLineSchema = z
  .object({
    articleId: z.string().trim().min(1),
    quantity: z.number().int().positive(),
  })
  .strict();

export const createCustomerOrderSchema = z
  .object({
    customerId: z.string().trim().min(1),
    lines: z.array(customerOrderLineSchema).min(1),
  })
  .strict();

export const listCustomerOrdersQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
    status: z.enum(["OPEN", "PICKED_UP"]).optional(),
  })
  .strict();

export type CreateCustomerOrderInput = z.infer<typeof createCustomerOrderSchema>;
