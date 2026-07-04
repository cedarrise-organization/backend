//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/responseHandler.js";

export const featureController = async (req: Request, res: Response, next: NextFunction) => {
  try {
     // const response = await exampleService();
    // successResponse(res, response.code, response.message, response.data)
  } catch (err) {
    next(err);
  }
};
