//CONTROLLER
import { Request, Response, NextFunction } from "express";
import {
  ashCarousel,
  capacityCarousel,
  outreachCarousel,
  tacotsCarousel,
} from "../../../services/clientside/carousels.services.js";
import { successResponse } from "../../../utils/responseHandler.js";

export const ashCarouselController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await ashCarousel();
    successResponse(res, response.code, response.message, response.data)
  } catch (err) {
    next(err);
  }
};

export const tacotsCarouselController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await tacotsCarousel();
    successResponse(res, response.code, response.message, response.data)
  } catch (err) {
    next(err);
  }
};

export const outreachCarouselController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await outreachCarousel();
    successResponse(res, response.code, response.message, response.data)
  } catch (err) {
    next(err);
  }
};

export const capacityCarouselController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await capacityCarousel();
    successResponse(res, response.code, response.message, response.data)
  } catch (err) {
    next(err);
  }
};
