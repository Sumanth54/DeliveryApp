import { z } from "zod";
import { Order } from "../models/Order.js";
import { createRazorpayOrder } from "../services/razorpayService.js";
import { buildOrderPricing } from "../services/orderService.js";
import { AppError } from "../utils/AppError.js";

const cartItemsSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.number().int().min(1).max(20)
      })
    )
    .min(1)
});

const createOrderSchema = cartItemsSchema.extend({
  paymentMethod: z.enum(["COD", "ONLINE"]),
  notes: z.string().trim().max(140).optional().or(z.literal("")),
  address: z.object({
    fullName: z.string().trim().min(2),
    phone: z.string().trim().regex(/^[6-9]\d{9}$/),
    line1: z.string().trim().min(5),
    landmark: z.string().trim().max(60).optional().or(z.literal("")),
    area: z.string().trim().min(2),
    city: z.string().trim().min(2),
    pincode: z.string().trim().regex(/^\d{6}$/)
  }),
  razorpayOrderId: z.string().trim().optional(),
  razorpayPaymentId: z.string().trim().optional()
});

const statusSchema = z.object({
  status: z.enum(["Pending", "Out for delivery", "Delivered"]),
  assignedRiderName: z.string().trim().max(50).optional().or(z.literal(""))
});

export async function createPaymentIntent(
  request: import("express").Request,
  response: import("express").Response
) {
  const payload = cartItemsSchema.parse(request.body);
  const pricing = await buildOrderPricing(payload.items);
  const razorpayOrder = await createRazorpayOrder(
    pricing.total,
    `order_${request.user?.id ?? "guest"}_${Date.now()}`
  );

  response.json({
    amount: pricing.total,
    currency: razorpayOrder.currency,
    providerOrderId: razorpayOrder.providerOrderId,
    keyId: razorpayOrder.keyId,
    isMock: razorpayOrder.isMock
  });
}

export async function createOrder(request: import("express").Request, response: import("express").Response) {
  const payload = createOrderSchema.parse(request.body);

  if (!request.user) {
    throw new AppError("Please log in to place an order.", 401);
  }

  const pricing = await buildOrderPricing(payload.items);
  const isOnline = payload.paymentMethod === "ONLINE";

  if (isOnline && !payload.razorpayPaymentId) {
    throw new AppError("Online payment was not completed.", 400);
  }

  const order = await Order.create({
    user: request.user.id,
    items: pricing.normalizedItems,
    address: {
      ...payload.address,
      landmark: payload.address.landmark || undefined
    },
    subtotal: pricing.subtotal,
    deliveryFee: pricing.deliveryFee,
    total: pricing.total,
    status: "Pending",
    paymentMethod: payload.paymentMethod,
    paymentStatus: isOnline ? "Paid" : "Pending",
    notes: payload.notes || undefined,
    razorpayOrderId: payload.razorpayOrderId,
    razorpayPaymentId: payload.razorpayPaymentId
  });

  const hydratedOrder = await Order.findById(order._id).populate("user", "name phone").lean();

  response.status(201).json(hydratedOrder);
}

export async function getMyOrders(request: import("express").Request, response: import("express").Response) {
  const orders = await Order.find({ user: request.user?.id })
    .sort({ createdAt: -1 })
    .populate("user", "name phone")
    .lean();

  response.json(orders);
}

export async function getOrderById(request: import("express").Request, response: import("express").Response) {
  const order = await Order.findById(request.params.id).populate("user", "name phone").lean();

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  const userId = "user" in order && order.user ? String(order.user._id ?? order.user) : "";
  const canAccess = request.user?.role === "admin" || userId === request.user?.id;

  if (!canAccess) {
    throw new AppError("You do not have access to this order.", 403);
  }

  response.json(order);
}

export async function getAllOrders(request: import("express").Request, response: import("express").Response) {
  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .populate("user", "name phone")
    .lean();

  response.json(orders);
}

export async function updateOrderStatus(
  request: import("express").Request,
  response: import("express").Response
) {
  const payload = statusSchema.parse(request.body);

  const order = await Order.findByIdAndUpdate(
    request.params.id,
    {
      status: payload.status,
      assignedRiderName: payload.assignedRiderName || undefined
    },
    {
      new: true
    }
  )
    .populate("user", "name phone")
    .lean();

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  response.json(order);
}
