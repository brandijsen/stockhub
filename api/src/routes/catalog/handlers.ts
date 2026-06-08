import type { Request, Response } from "express";

import { isPrismaUniqueViolation } from "../../lib/prisma-errors";
import { prisma } from "../../lib/prisma";
import { createBrandSchema, createCategorySchema } from "./schemas";

export async function listBrands(_req: Request, res: Response): Promise<void> {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ brands });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load brands" });
  }
}

export async function createBrand(req: Request, res: Response): Promise<void> {
  const parsed = createBrandSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  try {
    const brand = await prisma.brand.create({ data: parsed.data });
    res.status(201).json({ brand });
  } catch (e) {
    if (isPrismaUniqueViolation(e, "name")) {
      res.status(409).json({ error: "Brand already exists" });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Failed to create brand" });
  }
}

export async function listCategories(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ categories });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load categories" });
  }
}

export async function createCategory(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  try {
    const category = await prisma.category.create({ data: parsed.data });
    res.status(201).json({ category });
  } catch (e) {
    if (isPrismaUniqueViolation(e)) {
      res.status(409).json({ error: "Category name or slug already exists" });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Failed to create category" });
  }
}
