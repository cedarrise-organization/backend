//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/responseHandler.js";

export const featureController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const response = await exampleService();
    // successResponse(res, response.code, response.message, response.data, {correlationId: (req as any).correlationId})
  } catch (err) {
    next(err);
  }
};

export const feature2Controller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const response = await exampleService((req as any).correlationId);
    // successResponse(res, response.code, response.message, response.data, response.meta)
  } catch (err) {
    next(err);
  }
};
