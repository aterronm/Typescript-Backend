import { Collection, ObjectId } from "mongodb";
import { getDb } from "../config/db";

// Un ítem del carrito
export interface Item {
  productId: ObjectId; // ref Product
  quantity: number;    // min: 1
}


export interface Cart {
  _id?: ObjectId;
  userId: ObjectId;    // ref User (único por usuario)
  items: Item[];     
  createdAt?: Date;   
  updatedAt?: Date;
}

export const cartCollection = (): Collection<Cart> =>
  getDb().collection<Cart>("carts");

export const ensureCartIndexes = async (): Promise<void> => {
  await cartCollection().createIndex({ userId: 1 }, { unique: true, name: "uniq_cart_user" });
};
