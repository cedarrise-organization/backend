import jwt from "jsonwebtoken";
import { refresh } from "../services/auth.services.js";
import { Request, Response, NextFunction } from "express";
import { getUserPermissions } from "../utils/rbac.util.js";
import { verifyAccessToken } from "../utils/token.util.js";
import { ForbiddentError, UnauthorizedError } from "../lib/error.js";

export const authenticate = () => async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies["cedaraccess"];

  if (!token) throw new UnauthorizedError("No token provided");

  try {
    const payload = verifyAccessToken(token);

    if (payload.type !== "access") throw new UnauthorizedError("Invalid token type");

    req.user = { id: payload.sub };

    next();
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
      const refreshToken = req.cookies["cedarrefresh"];
      if (!refreshToken) throw new UnauthorizedError("No refresh token provided");
      
      const authResponse = await refresh(refreshToken);
      res.cookie("cedaraccess", authResponse.meta.accessToken, { httpOnly: true });
      res.cookie("cedarrefresh", authResponse.meta.refreshToken, { httpOnly: true });

      req.user = { id: authResponse.meta.sub };

      return next();
    }

    throw new UnauthorizedError("Invalid access token");
  }
};

export const authorize =
  (...requiredPermissions: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const userPermissions = await getUserPermissions(req.user.id);

      const missing = requiredPermissions.filter((p) => !userPermissions.includes(p));

      if (missing.length > 0) {
        throw new ForbiddentError("You do not have the required permission");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
