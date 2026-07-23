import express from "express";

import { requireAdmin } from "../../middleware/require-admin";
import { confirmCustomerOrderPickup } from "./handlers/confirm-pickup";
import { createCustomerOrder } from "./handlers/create";
import { getCustomerOrder } from "./handlers/get-one";
import { listCustomerOrders } from "./handlers/list";

const router = express.Router();

router.get("/", listCustomerOrders);
router.post("/", requireAdmin, createCustomerOrder);
router.get("/:id", getCustomerOrder);
router.post("/:id/confirm-pickup", confirmCustomerOrderPickup);

export default router;
