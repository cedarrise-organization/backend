//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { submitVRegisteration } from "../../services/volunteer.services.js";
import { successResponse } from "../../utils/responseHandler.js";
import { ValidationError } from "../../lib/error.js";

export const submitVRegisterationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {

  } = req.body;

  if (!req.files) throw new ValidationError("Please upload a file");

  try {
    // const response = await submitVRegisteration(req, {
    
    // });

    // return successResponse(res, response.code, response.message, response.data)
  } catch (err) {
    next(err);
  }
};
