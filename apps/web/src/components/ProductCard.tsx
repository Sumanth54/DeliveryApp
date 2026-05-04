import { memo, useCallback } from "react";
import { formatPrice } from "../lib/utils";
import type { Product } from "../types";

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
};

function ProductCardComponent({ product, onAdd }: ProductCardProps) {
  const handleAdd = useCallback(() => {
    onAdd(product);
  }, [onAdd, product]);

  return (
    <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-card">
      <img
        alt={product.name}
        className="h-44 w-full object-cover"
        decoding="async"
        loading="lazy"
        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
        src={product.imageUrl}
      />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
              {product.category}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate">{product.name}</h3>
          </div>
          {product.badge ? (
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
              {product.badge}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-stone-600">{product.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate">{formatPrice(product.price)}</span>
              <span className="text-sm text-stone-400 line-through">{formatPrice(product.mrp)}</span>
            </div>
            <p className="text-xs text-stone-500">{product.unit}</p>
          </div>
          <button
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
            onClick={handleAdd}
            type="button"
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardComponent);
