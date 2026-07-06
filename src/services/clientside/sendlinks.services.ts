import ejs from "ejs";
import logger from "../../configs/logger.config.js";
import { appEvents } from "../../lib/events.js";
import { ValidationError } from "../../lib/error.js";
import { sendEmail } from "../../utils/sendEmail.util.js";
import {
  Sendlinkemailtype,
  Sendpwsemailtype,
} from "../../modules/clientside/sendlinks/sendlinks.schema.js";
import { GENERAL_EVENTS } from "../../events/general.events.js";

const FRONTEND_BASEURL = process.env.FRONTEND_BASEURL;
export const sendLinkEmail = async (options: Sendlinkemailtype) => {
  const { email, name } = options.body;
  const { program, type } = options.query;

  if (program === "ASH") {
    switch (type) {
      case "REGISTRATION":
        let content1 = await ejs.renderFile(
          process.cwd() + "/src/views/emails/ash-registration-link.ejs",
          { name, formLink: `${FRONTEND_BASEURL}/social-initiatives/ash/register` },
          { async: true },
        );

        const info1 = await sendEmail(email, "ASH Registration Link", content1);

        if (!info1) {
          throw new Error("ASH Registration Email was not sent");
        }

        logger.info("ASH Registration Link email sent successully", {
          // correlationId
        });
        break;
      case "FEEDBACK":
        let content2 = await ejs.renderFile(
          process.cwd() + "/src/views/emails/ash-feedback-link.ejs",
          { name, formLink: `${FRONTEND_BASEURL}/social-initiatives/ash/feedback` },
          { async: true },
        );

        const info2 = await sendEmail(email, "ASH Feedback Link", content2);

        if (!info2) {
          throw new Error("ASH Feedback Email was not sent");
        }

        logger.info("ASH Feedback Link email sent successully", {
          // correlationId
        });
        break;
      default:
        throw new ValidationError(`Type "${type}" is invalid`);
    }
  } else if (program === "TACOTS") {
    switch (type) {
      case "REGISTRATION":
        let content1 = await ejs.renderFile(
          process.cwd() + "/src/views/emails/tacots-registration-link.ejs",
          { name, formLink: `${FRONTEND_BASEURL}/social-initiatives/tacots/recommendation` },
          { async: true },
        );

        const info1 = await sendEmail(email, "TACOTS Registration Link", content1);

        if (!info1) {
          throw new Error("TACOTS Registration Email was not sent");
        }

        logger.info("TACOTS Registration Link email sent successully", {
          // correlationId
        });
        break;
      case "FEEDBACK":
        let content2 = await ejs.renderFile(
          process.cwd() + "/src/views/emails/tacots-feedback-link.ejs",
          { name, formLink: `${FRONTEND_BASEURL}/social-initiatives/tacots/feedback` },
          { async: true },
        );

        const info2 = await sendEmail(email, "TACOTS Feedback Link", content2);

        if (!info2) {
          throw new Error("TACOTS Feedback Email was not sent");
        }

        logger.info("TACOTS Feedback Link email sent successully", {
          // correlationId
        });
        break;
      default:
        throw new ValidationError(`Type "${type}" is invalid`);
    }
  } else if (program === "VOLUNTEER") {
    switch (type) {
      case "REGISTRATION":
        let content1 = await ejs.renderFile(
          process.cwd() + "/src/views/emails/volunteer-registration-link.ejs",
          { name, formLink: `${FRONTEND_BASEURL}/get-involved/volunteer/register` },
          { async: true },
        );

        const info1 = await sendEmail(email, "VOLUNTEER Registration Link", content1);

        if (!info1) {
          throw new Error("VOLUNTEER Registration Email was not sent");
        }

        logger.info("VOLUNTEER Registration Link email sent successully", {
          // correlationId
        });
        break;
      case "FEEDBACK":
        let content2 = await ejs.renderFile(
          process.cwd() + "/src/views/emails/volunteer-feedback-link.ejs",
          { name, formLink: `${FRONTEND_BASEURL}/get-involved/volunteer/feedback` },
          { async: true },
        );

        const info2 = await sendEmail(email, "VOLUNTEER Feedback Link", content2);

        if (!info2) {
          throw new Error("Volunteer feedback Email was not sent");
        }

        logger.info("VOLUNTEER Feedback Link email sent successully", {
          // correlationId
        });
        break;
      default:
        throw new ValidationError(`Type "${type}" is invalid`);
    }
  } else {
    throw new ValidationError(`Program "${program}" is invalid`);
  }

  return {
    code: 200,
    message: `${program} ${type} email sent successfully`,
  };
};

export const sendPartnerWithUsEmail = async (options: Sendpwsemailtype) => {
  const { email, name, option } = options.body;

  let content = await ejs.renderFile(
    process.cwd() + "/src/views/emails/partner-with-cedar.ejs",
    { email, name, partnerAreas: option },
    { async: true },
  );

  const info = await sendEmail(
    process.env.CEDAR_EMAIL!.toString(),
    `${name} wants to Partner with us!`,
    content,
  );

  if (!info) {
    throw new Error("Partner With us Email was not sent");
  }

  appEvents.emit(GENERAL_EVENTS.SEND_PARTNER_REQUEST_EMAIL, { newPartnersCount: 1 });

  logger.info("Partner request email sent successully", {
    // correlationId
  });

  return {
    code: 200,
    message: `Partner request email sent successfully`,
  };
};
