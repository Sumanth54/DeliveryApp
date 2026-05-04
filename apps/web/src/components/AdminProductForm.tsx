import { useEffect, useState, type FormEvent } from "react";
import type { Product } from "../types";

type ProductPayload = Omit<Product, "_id" | "slug">;

type AdminProductFormProps = {
  initialProduct?: Product | null;
  onSubmit: (payload: ProductPayload) => Promise<void>;
  onCancelEdit: () => void;
};

const defaultState: ProductPayload = {
  name: "",
  category: "Staples",
  description: "",
  price: 0,
  mrp: 0,
  unit: "",
  imageUrl: "",
  badge: "",
  stockQty: 0,
  inStock: true,
  featured: false
};

export function AdminProductForm({
  initialProduct,
  onSubmit,
  onCancelEdit
}: AdminProductFormProps) {
  const [form, setForm] = useState<ProductPayload>(defaultState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setForm({
        name: initialProduct.name,
        category: initialProduct.category,
        description: initialProduct.description,
        price: initialProduct.price,
        mrp: initialProduct.mrp,
        unit: initialProduct.unit,
        imageUrl: initialProduct.imageUrl,
        badge: initialProduct.badge ?? "",
        stockQty: initialProduct.stockQty,
        inStock: initialProduct.inStock,
        featured: initialProduct.featured
      });
    } else {
      setForm(defaultState);
    }
  }, [initialProduct]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit(form);
      if (!initialProduct) {
        setForm(defaultState);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-card" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Products</p>
          <h3 className="text-xl font-bold text-slate">
            {initialProduct ? "Edit product" : "Add new product"}
          </h3>
        </div>
        {initialProduct ? (
          <button className="text-sm font-semibold text-stone-500" onClick={onCancelEdit} type="button">
            Cancel edit
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder="Product name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
        <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder="Unit" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
        <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder="Badge" value={form.badge ?? ""} onChange={(event) => setForm({ ...form, badge: event.target.value })} />
        <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder="Image URL" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
        <input className="rounded-2xl border border-stone-200 px-4 py-3" min={0} placeholder="Stock quantity" type="number" value={form.stockQty} onChange={(event) => setForm({ ...form, stockQty: Number(event.target.value) })} />
        <input className="rounded-2xl border border-stone-200 px-4 py-3" min={0} placeholder="Price" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} />
        <input className="rounded-2xl border border-stone-200 px-4 py-3" min={0} placeholder="MRP" type="number" value={form.mrp} onChange={(event) => setForm({ ...form, mrp: Number(event.target.value) })} />
      </div>

      <textarea className="min-h-24 w-full rounded-2xl border border-stone-200 px-4 py-3" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate">
          <input checked={form.inStock} onChange={(event) => setForm({ ...form, inStock: event.target.checked })} type="checkbox" />
          In stock
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate">
          <input checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} type="checkbox" />
          Featured
        </label>
      </div>

      <button className="rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white hover:bg-brand-600" disabled={submitting} type="submit">
        {submitting ? "Saving..." : initialProduct ? "Update product" : "Add product"}
      </button>
    </form>
  );
}
