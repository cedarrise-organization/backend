import { successResponse } from "../../../utils/responseHandler.js";
import { sendEmail } from "../../../utils/sendEmail.util.js";
import { Request, Response, NextFunction } from "express";
import logger from "../../../configs/logger.config.js";
import ejs from "ejs";

export const sendFeedbackMailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, feedback } = req.body;
  let content = await ejs.renderFile(
    process.cwd() + "/src/views/emails/feedback.ejs",
    { feedback },
    { async: true },
  );

  try {
    const info = await sendEmail(
      process.env.SMTP_USER_EMAIL!,
      `Feedback submitted by ${email}`,
      content,
    );

    if (!info) {
      return res.status(500).json({
        status: false,
        error: {
          code: 500,
          message: "Feedback email not sent.",
        },
      });
    }

    logger.info("Feedback email sent successully", {
      sender: email,
      info: info.accepted,
      // correlationId
    });

    return successResponse(res, 200, "Feedback email sent successully");
  } catch (err) {
    next(err);
  }
};
