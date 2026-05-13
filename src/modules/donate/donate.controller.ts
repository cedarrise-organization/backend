//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { initialtize } from "../../services/donate.service.js";
import { successResponse } from "../../utils/responseHandler.js";

export const initializeController = async (req: Request, res: Response, next: NextFunction) => {
  const { amount, email, name, comment } = req.body;
  const callback_url = process.env.PAYSTACK_CALLBACK!;

  try {
    const response = await initialtize({
      amount,
      email,
      callback_url,
      metadata: { name, comment },
    });

    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};
