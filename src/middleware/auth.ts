// src/middleware/auth.ts
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: { id: string; username?: string } & JwtPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // en prod, exige que exista

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers["authorization"] || "";
  // Debe ser "Bearer <token>"
  const isBearer = header.startsWith("Bearer ");
  const token = isBearer ? header.slice(7).trim() : null;

  if (!token) {
    // Requisito: 401 con texto plano "Token inválido"
    res.status(401).type("text").send("Token inválido");
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { sub?: string; username?: string };
    req.user = { id: String(decoded.sub || ""), username: decoded.username, ...decoded };
    next();
  } catch {
    // Requisito: 401 con texto plano "Token inválido"
    res.status(401).type("text").send("Token inválido");
  }
}
