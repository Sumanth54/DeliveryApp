import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { formatPrice } from "../lib/utils";
import type { Order } from "../types";

export function OrderConfirmationPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!token || !id) {
        return;
      }

      const data = await api.getOrder(token, id);
      setOrder(data);
    }

    void loadOrder();
  }, [id, token]);

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Order placed</p>
      <h2 className="mt-2 text-3xl font-bold text-slate">Your grocery order is confirmed.</h2>
      <p className="mt-3 text-stone-600">
        The local ops team can now see this order in the admin dashboard and manually update it through delivery.
      </p>

      {order ? (
        <div className="mt-6 rounded-3xl bg-stone-50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-500">Order ID</span>
            <span className="font-semibold text-slate">{order._id}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-stone-500">Payment</span>
            <span className="font-semibold text-slate">{order.paymentMethod}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-stone-500">Total</span>
            <span className="text-xl font-bold text-slate">{formatPrice(order.total)}</span>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white" to="/orders">
          View my orders
        </Link>
        <Link className="rounded-2xl border border-stone-200 px-5 py-3 font-semibold text-slate" to="/">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
