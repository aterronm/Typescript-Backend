// src/routes/auth.routes.ts
import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userCollection, User } from "../models/User";
import dotenv from "dotenv";


const router = Router();

router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      console.log('BODY:', req.body);

      const { username, email, password } = (req.body || {}) as {
        username?: string;
        email?: string;
        password?: string;
      };

      if (typeof username !== "string" || !username.trim()) {
        return res.status(400).json({ message: "username is required" });
      }
      if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ message: "email must be a valid email" });
      }
      if (typeof password !== "string" || password.length < 6) {
        return res
          .status(400)
          .json({ message: "password must be at least 6 characters" });
      }

      const users = userCollection();
      const existing = await users.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username.trim() }],
      });
      if (existing) {
        return res
          .status(409)
          .json({ message: "Username or email already registered" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await users.insertOne({
        username: username.trim(),
        email: email.toLowerCase(),
        passwordHash,
        createdAt: new Date(),
      } as User);

      return res.status(201).json({ message: "User created" });
    } catch (err: any) {
      if (err && err.code === 11000) {
        return res
          .status(409)
          .json({ message: "Username or email already registered" });
      }
      return next(err);
    }
  }
);

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = (req.body || {}) as {
        email?: string;
        password?: string;
      };

      if (typeof email !== "string" || typeof password !== "string") {
        return res
          .status(400)
          .json({ message: "email and password are required" });
      }

      const users = userCollection();
      const user = await users.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { sub: String(user._id), username: user.username },
        process.env.JWT_SECRET || "dev-secret",
        { expiresIn: "2h" }
      );

      return res.status(200).json({ token });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
