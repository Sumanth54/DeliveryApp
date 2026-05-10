import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import type { Product } from "../types";

export function HomePage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const data = await api.getProducts(selectedCategory, search);
        setProducts(data);
      } catch (loadError) {
        setProducts([]);
        setError(loadError instanceof Error ? loadError.message : "Failed to load products.");
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
  }, [search, selectedCategory]);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category))],
    [products]
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-[2rem] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-900 p-8 text-white shadow-card lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-50">
            Simplified Zepto-style MVP
          </p>
          <h2 className="mt-3 max-w-xl text-4xl font-black tracking-tight">
            Grocery delivery for one local Karnataka neighbourhood, built for speed.
          </h2>
          <p className="mt-4 max-w-2xl text-brand-50/90">
            Browse daily essentials, add items to cart, checkout with COD or Razorpay test mode,
            and keep the admin side simple enough for a small operations team.
          </p>
        </div>
        <div className="rounded-[1.75rem] bg-white/10 p-5 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-50">
            Coverage
          </p>
          <ul className="mt-4 space-y-3 text-sm text-brand-50/95">
            <li>Same-day delivery across a small service area in Karnataka</li>
            <li>Mock OTP login for fast local testing</li>
            <li>Admin updates order status manually</li>
            <li>Seeded with 24 grocery essentials</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-card lg:grid-cols-[1fr_auto] lg:items-center">
        <input
          className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-500"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search rice, milk, coffee..."
          value={search}
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                selectedCategory === category
                  ? "bg-brand-500 text-white"
                  : "bg-stone-100 text-stone-700"
              }`}
              key={category}
              onClick={() => setSelectedCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-card">
          Loading products...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700 shadow-card">
          {error}
        </div>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} onAdd={addToCart} product={product} />
          ))}
        </section>
      )}
    </div>
  );
}
