import { z } from "zod";

export const updateStaffRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

export type UpdateStaffRoleInput = z.infer<typeof updateStaffRoleSchema>;
