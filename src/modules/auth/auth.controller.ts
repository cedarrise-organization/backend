import { Request, Response, NextFunction } from "express";
import { login, logout } from "../../services/auth.services.js";
import { successResponse } from "../../utils/responseHandler.js";

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  try {
    const response = await login(email, password);

    res.cookie("cedaraccess", response.meta.accessToken, { httpOnly: true });
    res.cookie("cedarrefresh", response.meta.refreshToken, { httpOnly: true });

    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies["cedarrefresh"];

  await logout(refreshToken);

  return successResponse(res, 200, "Logged out successfully");
};
