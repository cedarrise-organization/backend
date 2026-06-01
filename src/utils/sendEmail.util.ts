import ejs from "ejs";
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

// optional - uncomment in prod
// try {
//   await transporter.verify();
//   logger.info("Send Email function is ready. Server ready.");
// } catch (err: any) {
//   logger.info("Send Email Verification failed:", { err: err.message });
// }

export const sendEmail = async (to: string, subject: string, content: string) => {
  let html = await ejs.renderFile(
    process.cwd()  + "/src/views/layout/template.ejs",
    { subject, title: subject, content, logourl: process.env.LOGOURL!.toString() },
    { async: true },
  );

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER_EMAIL, // sender address
      to, // recipient address
      subject,
      html,
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
        logger.error("Network error - retry later:", { err: err.message, recipient: to });
        // sendEmail(  recipient, subject, textBody, htmlBody)
        break;
      case "EAUTH":
        logger.error("Authentication failed:", { err: err.message, recipient: to });
        break;
      case "EENVELOPE":
        logger.error("Invalid recipients:", { err: err.rejected, recipient: to });
        break;
      default:
        logger.error("Error while sending mail:", { err: err.message, recipient: to });
    }
  }
};
