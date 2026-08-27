//CONTROLLER
import { Request, Response, NextFunction } from "express";
import {
  sendLinkEmail,
  sendPartnerWithUsEmail,
  sendAshOnlineEmail
} from "../../../services/clientside/sendlinks.services.js";
import { successResponse } from "../../../utils/responseHandler.js";

export const sendLinkEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { email, name } = req.body;
  const { program, type } = req.qtransformed;
  try {
    const response = await sendLinkEmail({
      body: {
        email,
        name,
      },
      query: {
        program,
        type,
      },
    });

    successResponse(res, response.code, response.message, null, {
      correlationId: (req as any).correlationId,
    });
  } catch (err) {
    next(err);
  }
};

export const sendPartnerWithUsEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, name, option } = req.body;
  try {
    const response = await sendPartnerWithUsEmail({ body: { email, name, option } });
    successResponse(res, response.code, response.message, null, {
      correlationId: (req as any).correlationId,
    });
  } catch (err) {
    next(err);
  }
};

  
export const sendAshOnlineEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, name } = req.body;
  try {
    const response = await sendAshOnlineEmail({body: { email, name }});
    successResponse(res, response.code, response.message, null, {
      correlationId: (req as any).correlationId,
    });
  } catch (err) {
    next(err);
  }
};