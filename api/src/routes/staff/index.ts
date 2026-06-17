import express from "express";

import { requireSuperAdmin } from "../../middleware/require-superadmin";
import { listStaff } from "./handlers/list";
import { updateStaffRole } from "./handlers/update-role";

const router = express.Router();

router.get("/", listStaff);
router.patch("/:id/role", requireSuperAdmin, updateStaffRole);

export default router;
