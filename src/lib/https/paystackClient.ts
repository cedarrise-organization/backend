import { createFetchClient } from "@zayne-labs/callapi";
import logger from "../../configs/logger.config.js";

export const callPaystackApi = createFetchClient({
	baseURL: process.env.PAYSTACK_BASE_URL!,
	retryAttempts: 1,
	throwOnError: true,
	timeout: 10000,
	// credentials: "same-origin",
	auth: process.env.PAYSTACK_API_KEY,
	onRequest: (ctx) => {
		logger.info("Making request to Paystack", {
			date: new Date(Date.now()),
			context: ctx,
		});
	},
	onResponse: (ctx) => {
		logger.info("Response from Paystack has been received", {
			date: new Date(Date.now()),
			context: ctx.data,
		});
	},
	onError: (ctx) => {
		logger.error("Paystack Api returned an error", {
			date: new Date(Date.now()),
			context: ctx.error.errorData,
		});
	},
	onSuccess: (ctx) => {
		logger.info("Request to Paystack was successful", {
			date: new Date(Date.now()),
			context: ctx.data,
		});
	},
	onRetry: (ctx) => {
		logger.info("Request failed. Retrying...", {
			date: new Date(Date.now()),
			context: ctx.error.errorData,
		});
	},
});
