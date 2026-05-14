import { Response } from "express";

export const trackTransactionStatus = (res: Response, status: string) => {
  switch (status) {
    case "abandoned":
      return res.status(500).json({
        status: false,
        error: {
          code: 500,
          message: "Donation attempt abanonded",
        },
      });
    case "failed":
      return res.status(500).json({
        status: false,
        error: {
          code: 500,
          message: "Donation attempt failed",
        },
      });
    case "pending":
      return res.status(202).json({
        status: false,
        error: {
          code: 202,
          message: "Donation attempt pending",
        },
      });
    case "processing":
      return res.status(202).json({
        status: false,
        error: {
          code: 202,
          message: "Donation attempt processing",
        },
      });
    case "ongoing":
      return res.status(202).json({
        status: false,
        error: {
          code: 202,
          message: "Donation attempt ongoing",
        },
      });
    case "reversed":
      return res.status(500).json({
        status: false,
        error: {
          code: 500,
          message: "Donation reversed",
        },
      });
    default:
      return res.status(500).json({
        status: false,
        error: {
          code: 500,
          message: "Donation attempt failed",
        },
      });
  }
};
