import type { Address, Order, PaymentIntent, Product, User } from "../types";

function normalizeApiBaseUrl(rawUrl?: string) {
  const fallbackUrl = "http://localhost:4000/api";

  if (!rawUrl) {
    return fallbackUrl;
  }

  const normalizedUrl = rawUrl.replace(/\/+$/, "");
  return normalizedUrl.endsWith("/api") ? normalizedUrl : `${normalizedUrl}/api`;
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const errorBody = (await response.json()) as { message?: string };
      message = errorBody.message ?? message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const api = {
  requestOtp: (phone: string, name: string) =>
    request<{ debugOtp: string; user: User }>("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone, name })
    }),

  verifyOtp: (phone: string, otp: string, name: string) =>
    request<{ token: string; user: User }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp, name })
    }),

  me: (token: string) =>
    request<{ user: User }>("/auth/me", {
      token
    }),

  getProducts: (category?: string, search?: string) => {
    const params = new URLSearchParams();

    if (category && category !== "All") {
      params.set("category", category);
    }

    if (search) {
      params.set("search", search);
    }

    return request<Product[]>(`/products${params.size ? `?${params.toString()}` : ""}`);
  },

  createProduct: (token: string, payload: Omit<Product, "_id" | "slug">) =>
    request<Product>("/products", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    }),

  updateProduct: (token: string, id: string, payload: Omit<Product, "_id" | "slug">) =>
    request<Product>(`/products/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload)
    }),

  deleteProduct: (token: string, id: string) =>
    request<{ message: string }>(`/products/${id}`, {
      method: "DELETE",
      token
    }),

  createPaymentIntent: (
    token: string,
    items: Array<{ productId: string; quantity: number }>
  ) =>
    request<PaymentIntent>("/orders/payment-intent", {
      method: "POST",
      token,
      body: JSON.stringify({ items })
    }),

  createOrder: (
    token: string,
    payload: {
      items: Array<{ productId: string; quantity: number }>;
      address: Address;
      paymentMethod: "COD" | "ONLINE";
      notes?: string;
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
    }
  ) =>
    request<Order>("/orders", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    }),

  getMyOrders: (token: string) =>
    request<Order[]>("/orders", {
      token
    }),

  getOrder: (token: string, id: string) =>
    request<Order>(`/orders/${id}`, {
      token
    }),

  getAllOrders: (token: string) =>
    request<Order[]>("/orders/admin/all", {
      token
    }),

  updateOrderStatus: (
    token: string,
    id: string,
    payload: { status: Order["status"]; assignedRiderName?: string }
  ) =>
    request<Order>(`/orders/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload)
    })
};
