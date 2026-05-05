import { Request, Response, NextFunction } from "express";
import { getUserPermissions } from "../utils/rbac.util.js";
import { ForbiddentError, UnauthorizedError } from "../lib/error.js";

export const authorize =
  (...requiredPermissions: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // if (!req.user) {
      //   throw new UnauthorizedError();
      // }
      
      // const userPermissions = await getUserPermissions(req.user.id)
      const userPermissions = await getUserPermissions("7939d388-8b44-4d10-9988-d05de8530bc7");

      const missing = requiredPermissions.filter((p) => !userPermissions.includes(p));
      
      if (missing.length > 0) {
        throw new ForbiddentError("You do not have the required permission");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
