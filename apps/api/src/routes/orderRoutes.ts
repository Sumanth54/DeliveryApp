import { Router } from "express";
import {
  createOrder,
  createPaymentIntent,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} from "../controllers/orderController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const orderRouter = Router();

orderRouter.use(asyncHandler(authenticate));
orderRouter.post("/payment-intent", asyncHandler(createPaymentIntent));
orderRouter.post("/", asyncHandler(createOrder));
orderRouter.get("/", asyncHandler(getMyOrders));
orderRouter.get("/admin/all", asyncHandler(requireAdmin), asyncHandler(getAllOrders));
orderRouter.patch(
  "/:id/status",
  asyncHandler(requireAdmin),
  asyncHandler(updateOrderStatus)
);
orderRouter.get("/:id", asyncHandler(getOrderById));
