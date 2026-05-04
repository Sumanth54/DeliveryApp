import { z } from "zod";
import { deleteCacheByPrefix, getCache, setCache } from "../config/cache.js";
import { Product } from "../models/Product.js";
import { AppError } from "../utils/AppError.js";
import { slugify } from "../utils/slugify.js";

const productSchema = z.object({
  name: z.string().trim().min(2),
  category: z.string().trim().min(2),
  description: z.string().trim().min(5),
  price: z.number().min(1),
  mrp: z.number().min(1),
  unit: z.string().trim().min(1),
  imageUrl: z.string().trim().url(),
  badge: z.string().trim().max(30).optional().or(z.literal("")),
  stockQty: z.number().int().min(0),
  inStock: z.boolean(),
  featured: z.boolean()
});

export async function getProducts(request: import("express").Request, response: import("express").Response) {
  const category = request.query.category?.toString();
  const search = request.query.search?.toString();
  const cacheKey = `products:list:${category ?? "all"}:${search ?? ""}`;
  const cachedProducts = await getCache<Record<string, unknown>[]>(cacheKey);

  if (cachedProducts) {
    response.json(cachedProducts);
    return;
  }

  const filters: Record<string, unknown> = {};

  if (category && category !== "All") {
    filters.category = category;
  }

  if (search) {
    filters.name = {
      $regex: search,
      $options: "i"
    };
  }

  const products = await Product.find(filters).sort({ featured: -1, createdAt: -1 }).lean();
  await setCache(cacheKey, products, 120);
  response.json(products);
}

export async function getProduct(request: import("express").Request, response: import("express").Response) {
  const cacheKey = `products:item:${request.params.id}`;
  const cachedProduct = await getCache<Record<string, unknown>>(cacheKey);

  if (cachedProduct) {
    response.json(cachedProduct);
    return;
  }

  const product = await Product.findById(request.params.id).lean();

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  await setCache(cacheKey, product, 300);
  response.json(product);
}

export async function createProduct(request: import("express").Request, response: import("express").Response) {
  const payload = productSchema.parse(request.body);
  const product = await Product.create({
    ...payload,
    badge: payload.badge || undefined,
    slug: slugify(payload.name)
  });

  await deleteCacheByPrefix("products:");

  response.status(201).json(product);
}

export async function updateProduct(request: import("express").Request, response: import("express").Response) {
  const payload = productSchema.parse(request.body);
  const product = await Product.findByIdAndUpdate(
    request.params.id,
    {
      ...payload,
      badge: payload.badge || undefined,
      slug: slugify(payload.name)
    },
    {
      new: true
    }
  );

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  await deleteCacheByPrefix("products:");
  response.json(product);
}

export async function deleteProduct(request: import("express").Request, response: import("express").Response) {
  const product = await Product.findByIdAndDelete(request.params.id);

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  await deleteCacheByPrefix("products:");
  response.json({
    message: "Product deleted."
  });
}
