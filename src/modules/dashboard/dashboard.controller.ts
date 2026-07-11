//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/responseHandler.js";
import {
  getCards,
  getStudentPerformance,
  getEnrollment,
  getInstEffectiveness,
  getNotifications,
  dismissNotification,
} from "../../services/dashboard.services.js";

export const getCardsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await getCards();
    successResponse(res, response.code, response.message, response.data, {
      correlationId: (req as any).correlationId,
    });
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
    successResponse(res, response.code, response.message, response.data, {
      correlationId: (req as any).correlationId,
    });
  } catch (err) {
    next(err);
  }
};

export const getEnrollmentController = async (req: Request, res: Response, next: NextFunction) => {
  const response = await getEnrollment();
  try {
    successResponse(res, response.code, response.message, response.data, {
      correlationId: (req as any).correlationId,
    });
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
    successResponse(res, response.code, response.message, response.data, {
      correlationId: (req as any).correlationId,
    });
  } catch (err) {
    next(err);
  }
};

export const getNotificationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page, limit } = req.qtransformed;
  try {
    const response = await getNotifications(page, limit, (req as any).correlationId);
    successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (err) {
    next(err);
  }
};

export const dismissNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await dismissNotification(id);
    successResponse(res, response.code, response.message, null, {
      correlationId: (req as any).correlationId,
    });
  } catch (err) {
    next(err);
  }
};

// export const featureController = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // const response = await exampleService();
//     // successResponse(res, response.code, response.message, response.data)
//   } catch (err) {
//     next(err);
//   }
// };
