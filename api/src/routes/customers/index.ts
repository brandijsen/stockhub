import express from "express";

import { requireAdmin } from "../../middleware/require-admin";
import { createCustomer } from "./handlers/create";
import { deleteCustomer } from "./handlers/delete";
import { getCustomer } from "./handlers/get-one";
import { listCustomers } from "./handlers/list";
import { updateCustomer } from "./handlers/update";

const router = express.Router();

router.get("/", listCustomers);
router.post("/", requireAdmin, createCustomer);
router.get("/:id", getCustomer);
router.patch("/:id", requireAdmin, updateCustomer);
router.delete("/:id", requireAdmin, deleteCustomer);

export default router;
