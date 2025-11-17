// src/app.ts
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import productsRoutes from "./routes/products.routes";
import cartRoutes from "./routes/cart.routes";

const app = express();

// Middlewares base
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// JSON inválido → 400 texto plano
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && (err as any).status === 400 && "body" in err) {
    res.status(400).type("text").send("Invalid JSON body");
    return;
  }
  next(err);
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);

// 404
app.use((_req, res) => res.status(404).json({ message: "Not found" }));

// Error genérico
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  if (res.headersSent) return;
  res.status(err?.status || 500).json({ message: err?.message || "Internal Server Error" });
});

export default app;
