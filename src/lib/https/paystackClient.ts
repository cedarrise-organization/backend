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
  onRequest: (ctx) => {
    logger.info("Request to Paystack has been made", { date: new Date(Date.now()), context: ctx });
  },
  onResponse: (ctx) => {
    logger.info("Response from Paystack has been received", { date: new Date(Date.now()), context: ctx });
  },
  onError: (ctx) => {
    logger.error("Paystack Api returned an error", { date: new Date(Date.now()), context: ctx });
  },
  onSuccess: (ctx) => {
    logger.info("Request to Paystack was successfuly", { date: new Date(Date.now()), context: ctx });
  },
  onRetry: (ctx) => {
    logger.info("Request failed. Retrying...", { date: new Date(Date.now()), context: ctx });
  },
});
