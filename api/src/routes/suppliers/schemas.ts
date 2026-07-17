import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => {
      if (value == null || value === "") {
        return null;
      }
      return value;
    });

export const createSupplierSchema = z
  .object({
    name: z.string().trim().min(1).max(256),
    email: z.string().trim().email().max(320),
    phone: optionalText(64),
    address: optionalText(5000),
  })
  .strict();

export const updateSupplierSchema = createSupplierSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
