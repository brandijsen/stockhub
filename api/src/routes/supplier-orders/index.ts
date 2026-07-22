import express from "express";

import { requireAdmin } from "../../middleware/require-admin";
import { closeSupplierOrder } from "./handlers/close";
import { completeSupplierOrderChecking } from "./handlers/complete-checking";
import { createSupplierOrder } from "./handlers/create";
import { declareSupplierOrderArrived } from "./handlers/declare-arrived";
import { deleteSupplierOrder } from "./handlers/delete";
import { getSupplierOrder } from "./handlers/get-one";
import { listSupplierOrders } from "./handlers/list";
import { updateSupplierOrder } from "./handlers/update";

const router = express.Router();

router.get("/", listSupplierOrders);
router.post("/", requireAdmin, createSupplierOrder);
router.get("/:id", getSupplierOrder);
router.post("/:id/declare-arrived", declareSupplierOrderArrived);
router.post("/:id/complete-checking", completeSupplierOrderChecking);
router.post("/:id/close", requireAdmin, closeSupplierOrder);
router.patch("/:id", requireAdmin, updateSupplierOrder);
router.delete("/:id", requireAdmin, deleteSupplierOrder);

export default router;
