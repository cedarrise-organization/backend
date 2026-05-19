//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../lib/error.js";

export const outreachController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {} = req.body;

  if (!req.files) throw new ValidationError("Please upload a file");

  try {
  
  } catch (err) {
    next(err);
  }
};
