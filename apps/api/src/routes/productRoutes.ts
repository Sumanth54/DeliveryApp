import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct
} from "../controllers/productController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const productRouter = Router();

productRouter.get("/", asyncHandler(getProducts));
productRouter.get("/:id", asyncHandler(getProduct));
productRouter.post("/", asyncHandler(authenticate), asyncHandler(requireAdmin), asyncHandler(createProduct));
productRouter.put(
  "/:id",
  asyncHandler(authenticate),
  asyncHandler(requireAdmin),
  asyncHandler(updateProduct)
);
productRouter.delete(
  "/:id",
  asyncHandler(authenticate),
  asyncHandler(requireAdmin),
  asyncHandler(deleteProduct)
);
