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
  const { max } = req.qtransformed;
  try {
    const response = await ashCarousel(max);
    successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (err) {
    next(err);
  }
};

export const tacotsCarouselController = async (req: Request, res: Response, next: NextFunction) => {
  const { max } = req.qtransformed;
  try {
    const response = await tacotsCarousel(max);
    successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (err) {
    next(err);
  }
};

export const outreachCarouselController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { max } = req.qtransformed;
  try {
    const response = await outreachCarousel(max);
    successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (err) {
    next(err);
  }
};

export const capacityCarouselController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { max } = req.qtransformed;
  try {
    const response = await capacityCarousel(max);
    successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (err) {
    next(err);
  }
};
