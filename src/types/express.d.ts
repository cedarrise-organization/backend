import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; name: string; department: string };
      qtransformed?: any; // for tranformations made to req.query
      correlationId?: string;
    }
  }
}
