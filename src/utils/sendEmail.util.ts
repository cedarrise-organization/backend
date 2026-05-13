import nodemailer from "nodemailer";
import logger from "../configs/logger.config.js";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", //  "smtp.example.com",
  port: 465, // Usually, port 465 for SSL or 587 for TLS
  secure: true, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

// optional
try {
  await transporter.verify();
  logger.info("Server is ready to take our messages");
} catch (err: any) {
  logger.info("Verification failed:", { err: err.message });
}

export const sendEmail = async (
  recipient: string,
  subject: string,
  textBody: string,
  htmlBody?: string,
) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER_EMAIL, // sender address
      to: recipient, // recipient address
      subject, // subject line
      text: textBody, // plain text body
      html: htmlBody, // HTML body
    });

    if (info.rejected.length > 0) {
      logger.warn("Some recipients were rejected:", { recipient: info.rejected });
    }

    logger.info("Message sent successfully", {
      messageId: info.messageId,
    });

    return info;
  } catch (err: any) {
    switch (err.code) {
      case "ECONNECTION":
      case "ETIMEDOUT":
        logger.error("Network error - retry later:", { err: err.message, recipient });
        // sendEmail(  recipient, subject, textBody, htmlBody)
        break;
      case "EAUTH":
        logger.error("Authentication failed:", { err: err.message, recipient });
        break;
      case "EENVELOPE":
        logger.error("Invalid recipients:", { err: err.rejected, recipient });
        break;
      default:
        logger.error("Error while sending mail:", { err: err.message, recipient });
    }
  }
};
