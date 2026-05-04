import { Schema, model } from "mongoose";

export interface ProductDocument {
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  mrp: number;
  unit: string;
  imageUrl: string;
  badge?: string;
  stockQty: number;
  inStock: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    badge: { type: String, trim: true },
    stockQty: { type: Number, required: true, min: 0, default: 0 },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

productSchema.index({ category: 1, featured: -1, createdAt: -1 });
productSchema.index({ name: "text", description: "text", category: "text" });

export const Product = model<ProductDocument>("Product", productSchema);
