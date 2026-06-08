//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/responseHandler.js";
import {
  getCards,
  getStudentPerformance,
  getEnrollment,
  getInstEffectiveness,
} from "../../services/dashboard.services.js";

export const getCardsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await getCards();
    successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const getStudentPerformanceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await getStudentPerformance();
    successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const getEnrollmentController = async (req: Request, res: Response, next: NextFunction) => {
  const response = await getEnrollment();
  try {
    successResponse(res, response.code, response.message, response.data)
  } catch (err) {
    next(err);
  }
};

export const getInstEffectivenessController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const response = await getInstEffectiveness();
  try {
    successResponse(res, response.code, response.message, response.data)
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
