//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { initialtize, verifyTransaction } from "../../../services/clientside/donate.services.js";
import { successResponse } from "../../../utils/responseHandler.js";
import { trackTransactionStatus } from "../../../lib/https/trackTransactionStatus.js";

export const initializeController = async (req: Request, res: Response, next: NextFunction) => {
  const { amount, email, name, supportAreas, comment } = req.body;
  const callback_url = process.env.PAYSTACK_CALLBACK!;

  try {
    const response = await initialtize({
      amount,
      email,
      callback_url,
      metadata: { name, comment, supportAreas },
    });

    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

// NOT COMPLETE
export const verifyViaWebhookController = async (req: Request, res: Response, next: NextFunction) => {
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
  const redirect_url = process.env.PAYSTACK_POST_DONATION_REDIRECT_URL!.toString();
  try {
    const response = await verifyTransaction(reference);

    if (response.data.data.status !== "success") {
      return trackTransactionStatus(res, response.data.data.status, redirect_url);
    }
    return res.redirect(`${redirect_url}?message=${response.message}`);
  } catch (error) {
    next(error);
  }
};
