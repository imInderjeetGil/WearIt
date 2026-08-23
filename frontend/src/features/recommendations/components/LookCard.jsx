import { useState } from "react";
import { Sparkles, Star, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import ProductCard from "../../catalog/components/product/ProductCard";
import { addToCart } from "../../cart/api/cart";

export default function LookCard({ look }) {
  const [adding, setAdding] = useState(false);

  async function handleAddAll() {
    setAdding(true);

    try {
      for (const item of look.items) {
        // Sized products use their first in-stock size; non-sized products
        // (no ProductSize rows) are added without a size.
        const sizeEntry =
          item.product.sizes?.find((s) => s.stock > 0) ||
          item.product.sizes?.[0];

        await addToCart(item.product.id, sizeEntry ? sizeEntry.size.id : null, 1);
      }

      toast.success("Look added to cart");
    } catch (err) {
      toast.error(err.response?.data?.detail ?? "Could not add the look");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:border-zinc-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white">
            <Sparkles size={15} />
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              {look.title}
            </p>
            <p className="text-xs text-zinc-500">
              {look.reason}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {look.approximate && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Approximate match
            </span>
          )}
          <div className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
            <Star size={13} fill="currentColor" className="text-yellow-500" />
            {look.score}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
        {look.items.map((item) => (
          <div key={item.product.id}>
            <ProductCard product={item.product} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-400">
            Look Total
          </p>
          <p className="text-lg font-bold text-zinc-900">
            ₹{look.total_price}
          </p>
        </div>
        <button
          onClick={handleAddAll}
          disabled={adding}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-6 font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {adding ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingBag size={16} />
              Add All to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}