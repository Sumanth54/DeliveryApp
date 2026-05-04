import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useRazorpayScript } from "../hooks/useRazorpayScript";
import { api } from "../lib/api";
import { formatPrice } from "../lib/utils";
import type { Address } from "../types";

type CartPageProps = {
  onOpenLogin: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const defaultAddress: Address = {
  fullName: "",
  phone: "",
  line1: "",
  landmark: "",
  area: "Jayanagar",
  city: "Bengaluru",
  pincode: "560041"
};

export function CartPage({ onOpenLogin }: CartPageProps) {
  const { items, subtotal, updateQuantity, clearCart } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const razorpayLoaded = useRazorpayScript();
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [address, setAddress] = useState<Address>(defaultAddress);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setAddress((current) => ({
        ...current,
        fullName: current.fullName || user.name,
        phone: current.phone || user.phone
      }));
    }
  }, [user]);

  const deliveryFee = useMemo(() => (subtotal >= 500 ? 0 : items.length > 0 ? 35 : 0), [items.length, subtotal]);
  const total = subtotal + deliveryFee;

  async function finalizeOrder(onlineMeta?: { razorpayOrderId?: string; razorpayPaymentId?: string }) {
    if (!token) {
      onOpenLogin();
      return;
    }

    const order = await api.createOrder(token, {
      items: items.map((item) => ({
        productId: item._id,
        quantity: item.quantity
      })),
      address,
      paymentMethod,
      notes,
      ...onlineMeta
    });

    clearCart();
    navigate(`/order-confirmation/${order._id}`);
  }

  async function handlePlaceOrder() {
    if (!token) {
      onOpenLogin();
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (paymentMethod === "COD") {
        await finalizeOrder();
        return;
      }

      const intent = await api.createPaymentIntent(
        token,
        items.map((item) => ({
          productId: item._id,
          quantity: item.quantity
        }))
      );

      if (!intent.keyId || !window.Razorpay || !razorpayLoaded) {
        await finalizeOrder({
          razorpayOrderId: intent.providerOrderId,
          razorpayPaymentId: `mock_payment_${Date.now()}`
        });
        return;
      }

      const razorpay = new window.Razorpay({
        key: intent.keyId,
        amount: Math.round(intent.amount * 100),
        currency: intent.currency,
        name: "Namma Basket",
        description: "Grocery order payment",
        order_id: intent.providerOrderId,
        prefill: {
          name: address.fullName,
          contact: address.phone
        },
        theme: {
          color: "#1f8f46"
        },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string }) => {
          await finalizeOrder({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id
          });
        }
      });

      razorpay.open();
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Failed to place order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <section className="space-y-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Cart</p>
            <h2 className="text-2xl font-bold text-slate">Review your basket</h2>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="rounded-2xl bg-stone-50 p-4 text-stone-600">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div className="flex gap-4 rounded-2xl border border-stone-100 p-3" key={item._id}>
                <img className="h-20 w-20 rounded-2xl object-cover" src={item.imageUrl} alt={item.name} />
                <div className="flex flex-1 items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate">{item.name}</h3>
                    <p className="text-sm text-stone-500">{item.unit}</p>
                    <p className="text-sm font-semibold text-brand-600">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="rounded-full border border-stone-200 px-3 py-1" onClick={() => updateQuantity(item._id, item.quantity - 1)} type="button">-</button>
                    <span className="font-semibold">{item.quantity}</span>
                    <button className="rounded-full border border-stone-200 px-3 py-1" onClick={() => updateQuantity(item._id, item.quantity + 1)} type="button">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5 rounded-3xl border border-stone-200 bg-white p-5 shadow-card">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Checkout</p>
          <h2 className="text-2xl font-bold text-slate">Delivery details</h2>
        </div>

        {!user ? (
          <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
            Login is required before placing an order.
            <button className="ml-2 font-semibold underline" onClick={onOpenLogin} type="button">
              Open OTP login
            </button>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder="Full name" value={address.fullName} onChange={(event) => setAddress({ ...address, fullName: event.target.value })} />
          <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder="Phone" value={address.phone} onChange={(event) => setAddress({ ...address, phone: event.target.value })} />
          <input className="rounded-2xl border border-stone-200 px-4 py-3 sm:col-span-2" placeholder="House / street / apartment" value={address.line1} onChange={(event) => setAddress({ ...address, line1: event.target.value })} />
          <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder="Landmark" value={address.landmark} onChange={(event) => setAddress({ ...address, landmark: event.target.value })} />
          <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder="Area" value={address.area} onChange={(event) => setAddress({ ...address, area: event.target.value })} />
          <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder="City" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} />
          <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder="Pincode" value={address.pincode} onChange={(event) => setAddress({ ...address, pincode: event.target.value })} />
        </div>

        <textarea className="min-h-24 w-full rounded-2xl border border-stone-200 px-4 py-3" placeholder="Notes for the rider" value={notes} onChange={(event) => setNotes(event.target.value)} />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className={`rounded-2xl border p-4 ${paymentMethod === "COD" ? "border-brand-500 bg-brand-50" : "border-stone-200"}`}>
            <input checked={paymentMethod === "COD"} className="mr-2" name="payment" onChange={() => setPaymentMethod("COD")} type="radio" />
            Cash on Delivery
          </label>
          <label className={`rounded-2xl border p-4 ${paymentMethod === "ONLINE" ? "border-brand-500 bg-brand-50" : "border-stone-200"}`}>
            <input checked={paymentMethod === "ONLINE"} className="mr-2" name="payment" onChange={() => setPaymentMethod("ONLINE")} type="radio" />
            Pay Online
          </label>
        </div>

        <div className="space-y-2 rounded-2xl bg-stone-50 p-4">
          <div className="flex justify-between text-sm text-stone-600">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-stone-600">
            <span>Delivery fee</span>
            <span>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          className="w-full rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={items.length === 0 || loading}
          onClick={handlePlaceOrder}
          type="button"
        >
          {loading ? "Processing..." : paymentMethod === "COD" ? "Place order" : "Continue to payment"}
        </button>

        <p className="text-xs text-stone-500">
          Razorpay opens in test mode when keys are configured. Without keys, online payments are simulated for MVP testing.
        </p>
      </section>
    </div>
  );
}
