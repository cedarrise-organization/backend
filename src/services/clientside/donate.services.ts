import { appEvents } from "../../lib/events.js";
import { DONATE_EVENTS } from "../../events/donate.events.js";
import { callPaystackApi } from "../../lib/https/paystackClient.js";

export const initialtize = async (body: {
  amount: number;
  email: string;
  callback_url: string;
  metadata: { name: string; comment: string };
}) => {
  const { data } = await callPaystackApi("/transaction/initialize", {
    body,
    method: "POST",
  });

  return {
    code: 200,
    message: "Transaction initialized successfully",
    data,
  };
};

export const verifyTransaction = async (reference: string) => {
  const { data } = await callPaystackApi<any>(`/transaction/verify/${reference}`, {
    method: "GET",
  });

  if (data.data.status === "success") {
    // emitter should go in webhook too
    appEvents.emit(DONATE_EVENTS.DONATION_MADE, {
      amount: data.data.amount / 100,
      email: data.data.customer.email,
      name: data.data.metadata.name,
      comment: data.data.metadata.comment,
      metaData: {
        code: 200,
        message: "Transaction verified successfully",
        data,
      },
      // correlationId
    });
  }

  return {
    code: 200,
    message: "Donation+made+successfully",
    data,
  };
};
