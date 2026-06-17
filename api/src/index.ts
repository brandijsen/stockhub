import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { apiJsonBodyLimit, trustProxySetting } from "./env";
import { apiErrorHandler, apiNotFoundHandler } from "./middleware/http-errors";
import { requireAuth } from "./middleware/require-auth";
import authRoutes from "./routes/auth";
import articleRoutes from "./routes/articles";
import catalogRoutes from "./routes/catalog";
import conversationRoutes from "./routes/conversations";
import staffRoutes from "./routes/staff";

const app = express();

const tp = trustProxySetting();
if (tp !== undefined) {
  app.set("trust proxy", tp);
}

/**
 * Security headers (non-CSP: API returns mostly JSON and redirects).
 * `crossOriginResourcePolicy: cross-origin` keeps browser credentialed fetches
 * from the Next origin working (Helmet's default CORP is stricter).
 */
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const port = Number(process.env.PORT) || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: apiJsonBodyLimit() }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "stockhub-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/articles", requireAuth, articleRoutes);
app.use("/api/catalog", requireAuth, catalogRoutes);
app.use("/api/staff", requireAuth, staffRoutes);
app.use("/api/conversations", requireAuth, conversationRoutes);

app.use(apiNotFoundHandler);
app.use(apiErrorHandler);

app.listen(port, () => {
  console.log(`StockHub API listening on http://localhost:${port}`);
});
