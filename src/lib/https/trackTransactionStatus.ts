import { Response } from "express";

export const trackTransactionStatus = (res: Response, status: string, redirect_url: string) => {
  switch (status) {
    case "abandoned":
      // return res.status(500).json({
      //   status: false,
      //   error: {
      //     code: 500,
      //     message: "Donation attempt abanonded",
      //   },
      // });
      return res.redirect(`${redirect_url}?error=Donation+attempt+abanonded`);
    case "failed":
      // return res.status(500).json({
      //   status: false,
      //   error: {
      //     code: 500,
      //     message: "Donation attempt failed",
      //   },
      // });
      return res.redirect(`${redirect_url}?error=Donation+attempt+failed`);
    case "pending":
      // return res.status(202).json({
      //   status: false,
      //   error: {
      //     code: 202,
      //     message: "Donation attempt pending",
      //   },
      // });
      return res.redirect(`${redirect_url}?error=Donation+attempt+pending`);
    case "processing":
      // return res.status(202).json({
      //   status: false,
      //   error: {
      //     code: 202,
      //     message: "Donation attempt processing",
      //   },
      // });
      return res.redirect(`${redirect_url}?error=Donation+attempt+processing`);
    case "ongoing":
      // return res.status(202).json({
      //   status: false,
      //   error: {
      //     code: 202,
      //     message: "Donation attempt ongoing",
      //   },
      // });
      return res.redirect(`${redirect_url}?error=Donation+attempt+ongoing`);
    case "reversed":
      // return res.status(500).json({
      //   status: false,
      //   error: {
      //     code: 500,
      //     message: "Donation reversed",
      //   },
      // });
      return res.redirect(`${redirect_url}?error=Donation+reversed`);
    default:
      // return res.status(500).json({
      //   status: false,
      //   error: {
      //     code: 500,
      //     message: "Donation attempt failed",
      //   },
      // });
      return res.redirect(`${redirect_url}?error=Donation+attempt+failed`);
  }
};