import { Request, Response, NextFunction } from "express";
import { getUserPermissions } from "../utils/rbac.util.js";
import { ForbiddentError, UnauthorizedError } from "../lib/error.js";

export const authorize =
  (...requiredPermissions: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      
      const userPermissions = await getUserPermissions(req.user.id)
      // const userPermissions = await getUserPermissions("eb0c38d4-6cb7-4c7b-8f75-986426cb1e60");

      const missing = requiredPermissions.filter((p) => !userPermissions.includes(p));
      
      if (missing.length > 0) {
        throw new ForbiddentError("You do not have the required permission");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
