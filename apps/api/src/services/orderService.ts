import { Product } from "../models/Product.js";
import { AppError } from "../utils/AppError.js";

type CheckoutLineInput = {
  productId: string;
  quantity: number;
};

export async function buildOrderPricing(items: CheckoutLineInput[]) {
  if (items.length === 0) {
    throw new AppError("Your cart is empty.", 400);
  }

  const uniqueIds = [...new Set(items.map((item) => item.productId))];
  const products = await Product.find({
    _id: {
      $in: uniqueIds
    }
  }).lean();

  if (products.length !== uniqueIds.length) {
    throw new AppError("Some cart items are no longer available.", 400);
  }

  const productMap = new Map(products.map((product) => [String(product._id), product]));

  const normalizedItems = items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product || !product.inStock) {
      throw new AppError("Some cart items are out of stock.", 400);
    }

    if (item.quantity < 1) {
      throw new AppError("Quantity must be at least 1.", 400);
    }

    return {
      product: product._id,
      name: product.name,
      imageUrl: product.imageUrl,
      quantity: item.quantity,
      price: product.price,
      unit: product.unit
    };
  });

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 500 ? 0 : 35;
  const total = subtotal + deliveryFee;

  return {
    normalizedItems,
    subtotal,
    deliveryFee,
    total
  };
}
