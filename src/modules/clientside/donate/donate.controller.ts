//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { Parser } from "json2csv";
import { successResponse } from "../../../utils/responseHandler.js";
import { trackTransactionStatus } from "../../../lib/https/trackTransactionStatus.js";
import {
  initialtize,
  verifyTransaction,
  getDonationRecords,
  deleteDonationRecords,
  exportDonorsTableToCSV,
} from "../../../services/clientside/donate.services.js";

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

    return successResponse(res, response.code, response.message, response.data, {
      correlationId: (req as any).correlationId,
    });
  } catch (error) {
    next(error);
  }
};

// NOT COMPLETE
export const verifyViaWebhookController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

export const getDonationRecordsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page, limit, orderBy, search, sortBy } = req.qtransformed;
  try {
    const response = await getDonationRecords(
      page,
      limit,
      orderBy,
      search,
      sortBy,
      (req as any).correlationId,
    );
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (error) {
    next(error);
  }
};
export const downloadDonationRecordsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await exportDonorsTableToCSV();

    const fields = [
      "id",
      "amount",
      "name",
      "email",
      "supportAreas",
      "comment",
      "metaData",
      "createdAt",
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", 'attachment; filename="donations.csv"');

    return res.status(200).send(Buffer.from(csv, "utf-8"));
  } catch (error) {
    next(error);
  }
};
export const deleteDonationRecordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteDonationRecords(id);
    return successResponse(res, response.code, response.message, null, {
      correlationId: (req as any).correlationId,
    });
  } catch (error) {
    next(error);
  }
};
