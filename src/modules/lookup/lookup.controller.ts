//CONTROLLER
import { Request, Response, NextFunction } from "express";
import {
  ashDropdown,
  recommendedDropdown,
  onboardedDropdown,
  volunteerDropdown,
  ashProfileDropdown,
  tacotsProfileDropdown,
} from "../../services/lookup.services.js";
import { successResponse } from "../../utils/responseHandler.js";

export const ashDropdownController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await ashDropdown();
    return successResponse(res, response.code, response.message, response.data, {
      correlationId: (req as any).correlationId,
    });
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
    return successResponse(res, response.code, response.message, response.data, {
      correlationId: (req as any).correlationId,
    });
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
    return successResponse(res, response.code, response.message, response.data, {
      correlationId: (req as any).correlationId,
    });
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
    return successResponse(res, response.code, response.message, response.data, {
      correlationId: (req as any).correlationId,
    });
  } catch (err) {
    next(err);
  }
};

export const tacotsProfileDropdownController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page, limit, orderBy, search } = req.qtransformed;
  try {
    const response = await tacotsProfileDropdown(page, limit, orderBy, search, (req as any).correlationId);
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (err) {
    next(err);
  }
};

export const ashProfileDropdownController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page, limit, orderBy, search } = req.qtransformed;
  try {
    const response = await ashProfileDropdown(page, limit, orderBy, search, (req as any).correlationId);
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (err) {
    next(err);
  }
};
