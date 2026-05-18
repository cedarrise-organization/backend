//CONTROLLER
import { Request, Response, NextFunction } from "express";

export const featureController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // successResponse(res, response.code, response.message, response.data)
  } catch (err) {
    next(err);
  }
};
