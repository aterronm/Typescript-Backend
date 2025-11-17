// src/routes/products.routes.ts
import { Router, Request, Response, NextFunction } from "express";
import { productCollection, Product } from "../models/Product";
import { verifyToken } from "../middleware/auth";

const router = Router();

// Público
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productCollection().find({}).toArray();
    return res.json(products);
  } catch (err) {
    return next(err);
  }
});

// Protegido
router.post("/",  verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description = "", price, stock } = (req.body || {}) as {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
    };

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "name is required" });
    }
    if (typeof price !== "number" || !isFinite(price) || price <= 0) {
      return res.status(400).json({ message: "price must be a number greater than 0" });
    }
    if (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ message: "stock must be an integer >= 0" });
    }

    const doc: Product = {
      name: name.trim(),
      description: String(description || ""),
      price,
      stock,
      createdAt: new Date(),
    };

    const col = productCollection();
    const { insertedId } = await col.insertOne(doc);
    const created = await col.findOne({ _id: insertedId });

    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
});

export default router;
