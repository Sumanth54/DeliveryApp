import Razorpay from "razorpay";
import { env } from "../config/env.js";

let razorpayClient: Razorpay | null = null;

function getClient() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    return null;
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret
    });
  }

  return razorpayClient;
}

export async function createRazorpayOrder(amount: number, receipt: string) {
  const client = getClient();

  if (!client) {
    return {
      providerOrderId: `mock_order_${Date.now()}`,
      keyId: "",
      currency: "INR",
      isMock: true
    };
  }

  const order = await client.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt
  });

  return {
    providerOrderId: order.id,
    keyId: env.razorpayKeyId,
    currency: order.currency,
    isMock: false
  };
}
