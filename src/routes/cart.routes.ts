// src/routes/cart.routes.ts
import { Router } from "express";
import { ObjectId } from "mongodb";
import { AuthRequest, verifyToken } from "../middleware/auth";
import { cartCollection } from "../models/Cart";
import { productCollection } from "../models/Product";

const router = Router();

router.put("/add", verifyToken, async (req, res, next) => {
  try {
    const { productId, quantity } = (req.body || {}) as {
      productId?: string;
      quantity?: number;
    };

    if (typeof productId !== "string" || !ObjectId.isValid(productId)) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res
        .status(400)
        .json({ message: "quantity must be a positive integer" });
    }

    const prodId = new ObjectId(productId);
    const product = await productCollection().findOne({ _id: prodId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const userId = new ObjectId((req as any).user.id);
    const carts = cartCollection();

    const cart =
      (await carts.findOne({ userId })) || { userId, items: [] as any[] };

    const idx = cart.items.findIndex(
      (i: any) => String(i.productId) === String(prodId)
    );
    const existingQty = idx >= 0 ? cart.items[idx].quantity : 0;
    const newTotalQty = existingQty + quantity;

    if (newTotalQty > product.stock) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    if (idx >= 0) {
      cart.items[idx].quantity = newTotalQty;
    } else {
      cart.items.push({ productId: prodId, quantity });
    }

    await carts.updateOne(
      { userId },
      { $set: { items: cart.items } },
      { upsert: true }
    );

    // "Populate" mínimo: name, price, stock
    const ids = cart.items.map((i: any) => new ObjectId(i.productId));
    const prods = await productCollection()
      .find({ _id: { $in: ids } }, { projection: { name: 1, price: 1, stock: 1 } })
      .toArray();
    const map = new Map(prods.map((p) => [String(p._id), p]));

    const populated = {
      userId: String(userId),
      items: cart.items.map((i: any) => {
        const p = map.get(String(i.productId));
        return {
          productId: p
            ? { _id: p._id, name: p.name, price: p.price, stock: p.stock }
            : i.productId,
          quantity: i.quantity,
        };
      }),
    };

    return res.json(populated);
  } catch (err) {
    return next(err);
  }
});

router.get("/", verifyToken, async (req, res, next) => {
  try {
    const userId = new ObjectId((req as any).user.id);
    const cart = await cartCollection().findOne({ userId });

    if (!cart) {
      return res.json({ userId: String(userId), items: [] });
    }

    const ids = cart.items.map((i: any) => new ObjectId(i.productId));
    const prods = await productCollection()
      .find({ _id: { $in: ids } }, { projection: { name: 1, price: 1, stock: 1 } })
      .toArray();
    const map = new Map(prods.map((p) => [String(p._id), p]));

    const populated = {
      userId: String(userId),
      items: cart.items.map((i: any) => {
        const p = map.get(String(i.productId));
        return {
          productId: p
            ? { _id: p._id, name: p.name, price: p.price, stock: p.stock }
            : i.productId,
          quantity: i.quantity,
        };
      }),
    };

    return res.json(populated);
  } catch (err) {
    return next(err);
  }
});

export default router;
