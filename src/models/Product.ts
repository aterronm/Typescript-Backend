// src/db/product.ts
import { Collection, ObjectId } from "mongodb";
import { getDb } from "../config/db";

export interface Product {
  _id?: ObjectId;
  name: string;
  description?: string;
  price: number;
  stock: number;
  createdAt?: Date;
}

export const productCollection = (): Collection<Product> =>
  getDb().collection<Product>("products");
