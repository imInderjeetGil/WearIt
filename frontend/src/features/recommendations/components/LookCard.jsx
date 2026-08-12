import { Sparkles, Star } from "lucide-react";

import ProductCard from "../../catalog/components/product/ProductCard";

export default function LookCard({ look }) {
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
              {look.label}
            </p>
            <p className="text-xs text-zinc-500">
              {look.reason}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
          <Star size={13} fill="currentColor" className="text-yellow-500" />
          {look.score}
        </div>
      </div>

      {/* Items */}
      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
        {look.items.map((item) => (
          <div key={item.product.id}>
            <ProductCard product={item.product} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-400">
            Look Total
          </p>
          <p className="text-lg font-bold text-zinc-900">
            ₹{look.total_price}
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Within budget ✓
        </span>
      </div>
    </div>
  );
}
