//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { ashStudentProfile, tacotsStudentProfile } from "../../services/studentprofile.services.js";
import { successResponse } from "../../utils/responseHandler.js";

export const getAshData = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  try {
    const response = await ashStudentProfile(id, (req as any).correlationId);
    successResponse(res, response.code, response.message, response.data, response.meta)
  } catch (err) {
    next(err);
  }
};

export const getTacotsData = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  try {
    const response = await tacotsStudentProfile(id, (req as any).correlationId);
    successResponse(res, response.code, response.message, response.data, response.meta)
  } catch (err) {
    next(err);
  }
};
