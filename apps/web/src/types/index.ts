export type UserRole = "customer" | "admin";

export type User = {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
};

export type Product = {
  _id: string;
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
};

export type CartItem = Product & {
  quantity: number;
};

export type Address = {
  fullName: string;
  phone: string;
  line1: string;
  landmark: string;
  area: string;
  city: string;
  pincode: string;
};

export type Order = {
  _id: string;
  user: {
    _id?: string;
    id?: string;
    name: string;
    phone: string;
    role?: UserRole;
  };
  items: Array<{
    product: string;
    name: string;
    imageUrl: string;
    quantity: number;
    price: number;
    unit: string;
  }>;
  address: Address;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "Pending" | "Out for delivery" | "Delivered";
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: "Pending" | "Paid" | "Failed";
  assignedRiderName?: string;
  notes?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentIntent = {
  amount: number;
  currency: string;
  providerOrderId: string;
  keyId: string;
  isMock: boolean;
};
