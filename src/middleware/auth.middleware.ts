import { Request, Response, NextFunction } from "express";
import { getUserPermissions } from "../utils/rbac.util.js";
import { verifyAccessToken } from "../utils/token.util.js";
import { ForbiddentError, UnauthorizedError } from "../lib/error.js";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.authorization;

  if (!token) throw new UnauthorizedError("No token provided");

  try {
    const payload = verifyAccessToken(token);

    if (payload.type !== "access") throw new UnauthorizedError("Invalid token type");

    req.user = { id: payload.sub };

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token expired");
    }
    throw new UnauthorizedError("Invalid token");
  }
};

export const authorize =
  (...requiredPermissions: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // if (!req.user) {
      //   throw new UnauthorizedError();
      // }

      // const userPermissions = await getUserPermissions(req.user.id)
      const userPermissions = await getUserPermissions("ca6be9d2-331d-40ea-b53f-9f01fdbeb806");

      const missing = requiredPermissions.filter((p) => !userPermissions.includes(p));

      if (missing.length > 0) {
        throw new ForbiddentError("You do not have the required permission");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
