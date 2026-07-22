import { z } from "zod";

export const SUPPLIER_ORDERS_PAGE_SIZE = 10;

const orderLineSchema = z.object({
  articleId: z.string().min(1),
  qtyOrdered: z.number().int().min(1).max(999_999),
});

export const createSupplierOrderSchema = z
  .object({
    supplierId: z.string().min(1),
    lines: z.array(orderLineSchema).min(1).max(100),
  })
  .strict()
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    for (const [index, line] of data.lines.entries()) {
      if (seen.has(line.articleId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duplicate article in order lines",
          path: ["lines", index, "articleId"],
        });
      }
      seen.add(line.articleId);
    }
  });

export const updateSupplierOrderSchema = createSupplierOrderSchema;

const checkingLineSchema = z.object({
  lineId: z.string().min(1),
  qtyReceivedActual: z.number().int().min(0).max(999_999),
  lineConform: z.boolean(),
});

export const completeCheckingSchema = z
  .object({
    lines: z.array(checkingLineSchema).min(1).max(100),
  })
  .strict()
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    for (const [index, line] of data.lines.entries()) {
      if (seen.has(line.lineId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duplicate line in checking payload",
          path: ["lines", index, "lineId"],
        });
      }
      seen.add(line.lineId);
    }
  });

export type CompleteCheckingInput = z.infer<typeof completeCheckingSchema>;

const optionalCloseNote = z
  .string()
  .trim()
  .max(5000)
  .optional()
  .nullable()
  .transform((value) => {
    if (value == null || value === "") {
      return null;
    }
    return value;
  });

export const closeSupplierOrderSchema = z
  .object({
    outcome: z.enum(["SUCCEEDED", "DONE"]),
    adminCloseNote: optionalCloseNote,
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.outcome === "DONE" && !data.adminCloseNote) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A note is required when closing with issues",
        path: ["adminCloseNote"],
      });
    }
  });

export type CloseSupplierOrderInput = z.infer<typeof closeSupplierOrderSchema>;

export const listSupplierOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(SUPPLIER_ORDERS_PAGE_SIZE)
    .default(SUPPLIER_ORDERS_PAGE_SIZE),
  status: z.enum(["PENDING"]).optional(),
});

export type CreateSupplierOrderInput = z.infer<typeof createSupplierOrderSchema>;
export type UpdateSupplierOrderInput = z.infer<typeof updateSupplierOrderSchema>;
