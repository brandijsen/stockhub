import express from "express";

import { getDashboardSummary } from "./handlers/summary";

const router = express.Router();

router.get("/summary", getDashboardSummary);

export default router;
