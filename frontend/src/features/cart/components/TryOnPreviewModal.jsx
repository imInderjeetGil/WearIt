import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";

const STATUS_STEPS = [
  "Analyzing outfit fit...",
  "Compositing garments...",
  "Applying studio lighting...",
  "Fine-tuning proportions...",
  "Almost ready...",
];

const SLOT_SECTIONS = ["Topwear", "Bottomwear", "Footwear"];

// Split-view preview modal: cart items on the left, the generated AI render
// on the right. Purely presentational — generation state is owned by CartPage.
export default function TryOnPreviewModal({
  open,
  onClose,
  lines = [],
  total = 0,
  imageUrl = "",
  loading = false,
  error = null,
  slotByProduct = {},
  onRegenerate,
  onCheckout,
}) {
  const [statusIndex, setStatusIndex] = useState(0);

  // Cycle through playful status messages while a render is in flight.
  useEffect(() => {
    if (!loading) {
      setStatusIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setStatusIndex((index) =>
        Math.min(index + 1, STATUS_STEPS.length - 1)
      );
    }, 2400);

    return () => clearInterval(timer);
  }, [loading]);

  // Lock background scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const sections = useMemo(() => {
    const buckets = {};
    SLOT_SECTIONS.forEach((slot) => (buckets[slot] = []));
    buckets["Also in your cart"] = [];

    for (const line of lines) {
      const slot = slotByProduct[line.productId];
      buckets[SLOT_SECTIONS.includes(slot) ? slot : "Also in your cart"].push(
        line
      );
    }

    return Object.entries(buckets).filter(([, items]) => items.length > 0);
  }, [lines, slotByProduct]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative mx-auto my-6 w-[calc(100%-2rem)] max-w-5xl rounded-2xl bg-white shadow-2xl sm:my-10">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white">
              <Sparkles size={16} />
            </span>
            <div>
              <h2 className="text-lg font-bold">Your Outfit Preview</h2>
              <p className="text-xs text-zinc-500">
                AI Try-On · {lines.length} item{lines.length === 1 ? "" : "s"} · ₹{total}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* Split view */}
        <div className="grid gap-0 md:grid-cols-[320px_1fr]">

          {/* Left: items included in this look */}
          <div className="max-h-[60vh] space-y-5 overflow-y-auto border-b border-zinc-100 p-6 md:max-h-none md:border-b-0 md:border-r">
            {sections.map(([title, group]) => (
              <div key={title}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {title}
                </p>

                <div className="space-y-3">
                  {group.map((line) => (
                    <div key={line.id} className="flex items-center gap-3">
                      <img
                        src={line.imageUrl}
                        alt={line.name}
                        className="h-16 w-12 shrink-0 rounded-lg object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {line.name}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          ₹{line.price}
                          {line.sizeName ? ` · Size ${line.sizeName}` : ""}
                          {line.quantity > 1 ? ` × ${line.quantity}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right: generated AI image */}
          <TryOnResult
            imageUrl={imageUrl}
            loading={loading}
            error={error}
            statusIndex={statusIndex}
            onRegenerate={onRegenerate}
          />
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-3 border-t border-zinc-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            onClick={onRegenerate}
            disabled={loading}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border px-6 font-semibold transition hover:bg-zinc-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Re-generate
          </button>

          <button
            onClick={() => {
              onClose();
              onCheckout();
            }}
            disabled={loading || !imageUrl}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-8 font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            <ShoppingBag size={16} />
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

// --- part 2: result pane ---

function TryOnResult({ imageUrl, loading, error, statusIndex, onRegenerate }) {
  return (
    <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-zinc-50 p-4 md:min-h-[560px]">
      {imageUrl && (
        <img
          src={imageUrl}
          alt="AI try-on preview"
          className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${
            loading ? "scale-105 blur-sm brightness-75" : ""
          }`}
        />
      )}

      {loading && (
        <div className="relative z-10 flex flex-col items-center gap-4 rounded-2xl bg-black/60 px-8 py-8 text-center text-white backdrop-blur">
          <Loader2 size={34} className="animate-spin" />
          <div>
            <p className="font-semibold">{STATUS_STEPS[statusIndex]}</p>
            <p className="mt-1 text-xs text-zinc-300">
              This usually takes 20–60 seconds.
            </p>
          </div>

          <div className="mt-1 h-1.5 w-48 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{
                width: `${((statusIndex + 1) / STATUS_STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="relative z-10 max-w-xs text-center">
          <AlertCircle size={40} className="mx-auto text-red-400" />
          <p className="mt-3 font-semibold text-zinc-900">
            Preview could not be generated
          </p>
          <p className="mt-1 text-sm text-zinc-500">{error}</p>
          <button
            onClick={onRegenerate}
            className="mt-5 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && !imageUrl && (
        <div className="text-center text-zinc-400">
          <Sparkles size={36} className="mx-auto" />
          <p className="mt-3 text-sm">Your preview will appear here.</p>
        </div>
      )}
    </div>
  );
}
