//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { getCards } from "../../services/dashboard.services.js";
import { successResponse } from "../../utils/responseHandler.js";

export const getCardsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await getCards()
    successResponse(res, response.code, response.message, response.data)
  } catch (err) {
    next(err);
  }
};

export const featureController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // successResponse(res, response.code, response.message, response.data)
  } catch (err) {
    next(err);
  }
};

// export const featureController = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // successResponse(res, response.code, response.message, response.data)
//   } catch (err) {
//     next(err);
//   }
// };
