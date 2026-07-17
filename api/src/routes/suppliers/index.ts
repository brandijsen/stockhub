import express from "express";

import { requireAdmin } from "../../middleware/require-admin";
import { createSupplier } from "./handlers/create";
import { deleteSupplier } from "./handlers/delete";
import { getSupplier } from "./handlers/get-one";
import { listSuppliers } from "./handlers/list";
import { updateSupplier } from "./handlers/update";

const router = express.Router();

router.get("/", listSuppliers);
router.post("/", requireAdmin, createSupplier);
router.get("/:id", getSupplier);
router.patch("/:id", requireAdmin, updateSupplier);
router.delete("/:id", requireAdmin, deleteSupplier);

export default router;
