import { DONATE_EVENTS } from "../events/donate.event.js";
import { appEvents } from "../lib/events.js";
import { callPaystackApi } from "../lib/https/paystackClient.js";

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

  // event should go in verify route or webhook
  appEvents.emit(DONATE_EVENTS.DONATION_MADE, {
    amount: body.amount,
    email: body.email,
    name: body.metadata.name,
    comment: body.metadata.comment,
    // correlationId
  });

  return {
    code: 200,
    message: "Transaction initialized successfully",
    data,
  };
};
