import { useEffect, useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { formatDate, formatPrice } from "../lib/utils";
import type { Order } from "../types";

type OrdersPageProps = {
  onOpenLogin: () => void;
};

export function OrdersPage({ onOpenLogin }: OrdersPageProps) {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      if (!token) {
        return;
      }

      setLoading(true);
      const data = await api.getMyOrders(token);
      setOrders(data);
      setLoading(false);
    }

    void loadOrders();
  }, [token]);

  if (!user) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-card">
        <h2 className="text-2xl font-bold text-slate">Login to view your orders</h2>
        <p className="mt-2 text-stone-600">We keep order history behind OTP login.</p>
        <button className="mt-4 rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white" onClick={onOpenLogin} type="button">
          Open OTP login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Orders</p>
        <h2 className="text-3xl font-bold text-slate">Your delivery history</h2>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-card">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-card">
          No orders yet. Place your first grocery order from the home page.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-card" key={order._id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate">Order #{order._id.slice(-6).toUpperCase()}</h3>
                  <p className="text-sm text-stone-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={order.status} />
                  <StatusBadge status={order.paymentStatus} />
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                <div>
                  <ul className="space-y-2 text-sm text-stone-600">
                    {order.items.map((item) => (
                      <li key={`${order._id}-${item.name}`}>
                        {item.quantity} x {item.name} · {formatPrice(item.price)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-stone-500">
                    Delivery to {order.address.line1}, {order.address.area}, {order.address.city}
                  </p>
                  {order.assignedRiderName ? (
                    <p className="mt-1 text-sm text-stone-500">Assigned rider: {order.assignedRiderName}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-sm text-stone-500">{order.paymentMethod}</p>
                  <p className="text-2xl font-bold text-slate">{formatPrice(order.total)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
