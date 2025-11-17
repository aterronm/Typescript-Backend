// src/db/user.ts
import { Collection, ObjectId } from "mongodb";
import { getDb } from "../config/db";

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  createdAt?: Date;
}

export const userCollection = (): Collection<User> =>
  getDb().collection<User>("users");

