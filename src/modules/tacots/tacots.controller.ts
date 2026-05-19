//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/responseHandler.js";
import { submitReccomendation } from "../../services/tacots.services.js";
import { ValidationError } from "../../lib/error.js";

export const submitReccomendationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {} = req.body;

  if (!req.files) throw new ValidationError("Please upload a file");

  try {
    // const response = await submitReccomendation(req, {}); 

    // return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};
