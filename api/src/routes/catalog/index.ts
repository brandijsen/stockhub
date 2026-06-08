import express from "express";

import { requireAdmin } from "../../middleware/require-admin";
import {
  createBrand,
  createCategory,
  listBrands,
  listCategories,
} from "./handlers";

const router = express.Router();

router.get("/brands", listBrands);
router.post("/brands", requireAdmin, createBrand);
router.get("/categories", listCategories);
router.post("/categories", requireAdmin, createCategory);

export default router;
