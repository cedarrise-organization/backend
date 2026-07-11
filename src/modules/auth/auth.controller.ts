import { Request, Response, NextFunction } from "express";
import { login, logout } from "../../services/auth.services.js";
import { successResponse } from "../../utils/responseHandler.js";
import { accessCookieOptions, refreshCookieOptions } from "../../lib/cookie.js";

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  try {
    const response = await login(
      email,
      password,
      (req as any).correlationId,
      (req.headers["user-agent"] as string),
    );

    res.cookie("cedaraccess", response.meta.accessToken, accessCookieOptions);
    res.cookie("cedarrefresh", response.meta.refreshToken, refreshCookieOptions);

    return successResponse(res, response.code, response.message, response.data, {
      correlationId: (req as any).correlationId,
    });
  } catch (err) {
    next(err);
  }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies["cedarrefresh"];

  await logout(refreshToken);

  return successResponse(res, 200, "Logged out successfully", null, {
    correlationId: (req as any).correlationId,
  });
};

export const sessionController = async (req: Request, res: Response, next: NextFunction) => {
  return successResponse(res, 200, "User session verified", {
    id: (req as any).user.id,
    name: (req as any).user.name,
    department: (req as any).user.department,
  });
};
