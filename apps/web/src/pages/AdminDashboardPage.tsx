import { useEffect, useState } from "react";
import { AdminProductForm } from "../components/AdminProductForm";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { formatDate, formatPrice } from "../lib/utils";
import type { Order, Product } from "../types";

type AdminDashboardPageProps = {
  onOpenLogin: () => void;
};

type ProductPayload = Omit<Product, "_id" | "slug">;

export function AdminDashboardPage({ onOpenLogin }: AdminDashboardPageProps) {
  const { token, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [error, setError] = useState("");

  async function loadAdminData(currentToken: string) {
    const [productsData, ordersData] = await Promise.all([
      api.getProducts(),
      api.getAllOrders(currentToken)
    ]);
    setProducts(productsData);
    setOrders(ordersData);
  }

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      return;
    }

    void loadAdminData(token);
  }, [token, user?.role]);

  if (!user) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-card">
        <h2 className="text-2xl font-bold text-slate">Admin login required</h2>
        <p className="mt-2 text-stone-600">Use the seeded admin phone number to access operations.</p>
        <button className="mt-4 rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white" onClick={onOpenLogin} type="button">
          Open OTP login
        </button>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-card">
        <h2 className="text-2xl font-bold text-slate">Admin access only</h2>
        <p className="mt-2 text-stone-600">Login with phone <strong>9876500000</strong> to access this dashboard.</p>
      </div>
    );
  }

  async function handleSubmitProduct(payload: ProductPayload) {
    if (!token) {
      return;
    }

    try {
      setError("");
      if (editingProduct) {
        await api.updateProduct(token, editingProduct._id, payload);
        setEditingProduct(null);
      } else {
        await api.createProduct(token, payload);
      }

      await loadAdminData(token);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save product.");
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!token || !window.confirm("Delete this product?")) {
      return;
    }

    await api.deleteProduct(token, id);
    await loadAdminData(token);
  }

  async function handleStatusUpdate(orderId: string, status: Order["status"], assignedRiderName: string) {
    if (!token) {
      return;
    }

    const updated = await api.updateOrderStatus(token, orderId, {
      status,
      assignedRiderName
    });

    setOrders((current) => current.map((order) => (order._id === orderId ? updated : order)));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Admin panel</p>
          <h2 className="text-3xl font-bold text-slate">Store operations dashboard</h2>
        </div>
        <div className="flex gap-2">
          <button className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === "products" ? "bg-brand-500 text-white" : "bg-white text-slate"}`} onClick={() => setActiveTab("products")} type="button">
            Products
          </button>
          <button className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === "orders" ? "bg-brand-500 text-white" : "bg-white text-slate"}`} onClick={() => setActiveTab("orders")} type="button">
            Orders
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {activeTab === "products" ? (
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <AdminProductForm initialProduct={editingProduct} onCancelEdit={() => setEditingProduct(null)} onSubmit={handleSubmitProduct} />
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr className="border-t border-stone-100" key={product._id}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate">{product.name}</div>
                        <div className="text-xs text-stone-500">{product.unit}</div>
                      </td>
                      <td className="px-4 py-3">{product.category}</td>
                      <td className="px-4 py-3">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3">{product.stockQty}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="rounded-full bg-stone-100 px-3 py-1 font-semibold text-slate" onClick={() => setEditingProduct(product)} type="button">
                            Edit
                          </button>
                          <button className="rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700" onClick={() => handleDeleteProduct(product._id)} type="button">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-card" key={order._id}>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate">
                    {order.user?.name ?? "Customer"} · {order.user?.phone ?? ""}
                  </h3>
                  <p className="text-sm text-stone-500">{formatDate(order.createdAt)}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {order.address.line1}, {order.address.area}, {order.address.city}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={order.status} />
                  <StatusBadge status={order.paymentStatus} />
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                    {order.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_auto]">
                <div>
                  <ul className="space-y-2 text-sm text-stone-600">
                    {order.items.map((item) => (
                      <li key={`${order._id}-${item.name}`}>
                        {item.quantity} x {item.name} · {formatPrice(item.price)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 font-semibold text-slate">Total: {formatPrice(order.total)}</p>
                </div>
                <div className="flex flex-col gap-3 xl:w-80">
                  <select
                    className="rounded-2xl border border-stone-200 px-4 py-3"
                    defaultValue={order.status}
                    onChange={(event) =>
                      handleStatusUpdate(
                        order._id,
                        event.target.value as Order["status"],
                        order.assignedRiderName ?? ""
                      )
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <input
                    className="rounded-2xl border border-stone-200 px-4 py-3"
                    defaultValue={order.assignedRiderName ?? ""}
                    onBlur={(event) =>
                      handleStatusUpdate(order._id, order.status, event.target.value)
                    }
                    placeholder="Assign rider manually"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
