//CONTROLLER
import { Request, Response, NextFunction } from "express";
import {
  ashDropdown,
  recommendedDropdown,
  onboardedDropdown,
  volunteerDropdown,
} from "../../services/lookup.services.js";
import { successResponse } from "../../utils/responseHandler.js";

export const ashDropdownController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await ashDropdown();
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const recommendedDropdownController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await recommendedDropdown();
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const onboardedDropdownController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await onboardedDropdown();
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const volunteerDropdownController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await volunteerDropdown();
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};
