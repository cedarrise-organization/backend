//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { initialtize, verifyTransaction } from "../../services/donate.services.js";
import { successResponse } from "../../utils/responseHandler.js";
import { trackTransactionStatus } from "../../lib/https/trackTransactionStatus.js";

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

export const verifyController = async (req: Request, res: Response, next: NextFunction) => {
  const event = req.body;
  console.log("\n WEBOOK ROUTE GOT HIT \n");
  console.log(event);
  res.send(200);
};

export const verifyViaCallbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { reference } = req.qtransformed;
  try {
    const response = await verifyTransaction(reference);

    if (response.data.data.status !== "success") {
      return trackTransactionStatus(res, response.data.data.status); 
    }

    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};
