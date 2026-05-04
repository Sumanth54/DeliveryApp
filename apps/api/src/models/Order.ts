import { Schema, Types, model } from "mongoose";

export type PaymentMethod = "COD" | "ONLINE";
export type PaymentStatus = "Pending" | "Paid" | "Failed";
export type OrderStatus = "Pending" | "Out for delivery" | "Delivered";

interface Address {
  fullName: string;
  phone: string;
  line1: string;
  landmark?: string;
  area: string;
  city: string;
  pincode: string;
}

interface OrderItem {
  product: Types.ObjectId;
  name: string;
  imageUrl: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface OrderDocument {
  user: Types.ObjectId;
  items: OrderItem[];
  address: Address;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  assignedRiderName?: string;
  notes?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<OrderDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        imageUrl: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        unit: { type: String, required: true }
      }
    ],
    address: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      line1: { type: String, required: true },
      landmark: String,
      area: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true }
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Out for delivery", "Delivered"],
      default: "Pending"
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },
    assignedRiderName: String,
    notes: String,
    razorpayOrderId: String,
    razorpayPaymentId: String
  },
  {
    timestamps: true
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export const Order = model<OrderDocument>("Order", orderSchema);
