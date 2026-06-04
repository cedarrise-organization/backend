import { createFetchClient } from "@zayne-labs/callapi";
import logger from "../../configs/logger.config.js";

export const callPaystackApi = createFetchClient({
  baseURL: process.env.PAYSTACK_BASE_URL!,
  retryAttempts: 1,
  throwOnError: true,
  timeout: 10000,
  dedupeStrategy: "cancel",
  // credentials: "same-origin",
  auth: process.env.PAYSTACK_API_KEY,
  onRequest: (ctx: any) => {
    logger.info("Request to Paystack has been made", {
      date: new Date(Date.now()),
      context: ctx.data,
    });
  },
  onResponse: (ctx: any) => {
    logger.info("Response from Paystack has been received", {
      date: new Date(Date.now()),
      context: ctx.data,
    });
  },
  onError: (ctx: any) => {
    logger.error("Paystack Api returned an error", {
      date: new Date(Date.now()),
      context: ctx.data,
    });
  },
  onSuccess: (ctx: any) => {
    logger.info("Request to Paystack was successfuly", {
      date: new Date(Date.now()),
      context: ctx.data,
    });
  },
  onRetry: (ctx: any) => {
    logger.info("Request failed. Retrying...", { date: new Date(Date.now()), context: ctx.data });
  },
});
