import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export const verifyPaystackHook = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;
  const signature = req.headers["x-paystack-signature"] as string;

  if (!signature) {
    return res.status(401).json({
      error: "Missing signature header",
    });
  }

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_API_KEY!)
    .update(JSON.stringify(payload))
    .digest("hex");

  if (hash !== signature) {
    return res.status(401).json({
      error: "Invalid signature",
    });
  }

  next();

// ALTERNATIVELY USE timingSafeEqual TO PREVENT TIMING ATTACKS
//   const provided = Buffer.from(signature, "hex");
//   const expected = Buffer.from(hash, "hex");

//   if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
//     return res.status(401).json({ error: "Invalid signature" });
//   }

//   next();
};
