// src/pages/CartPage.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import useCartStore from "../store/cart-store";
import { getSellingPrice } from "../../../shared/utils/pricing";
import TryOnReferenceModal from "../components/TryOnReferenceModal";
import TryOnPreviewModal from "../components/TryOnPreviewModal";
import { generateTryOn } from "../api/tryon";
import { getProfile } from "../../profile/api/profile";

export default function CartPage() {
  const navigate = useNavigate();

  const {
    items,
    loading,
    fetchCart,
    removeItem,
    updateItem,
    subtotal,
  } = useCartStore();

  // AI Try-On state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [tryOnError, setTryOnError] = useState(null);
  // product_id -> category slot ("Topwear"/"Bottomwear"/...) returned by the
  // generate endpoint; used to group items in the preview modal.
  const [slotByProduct, setSlotByProduct] = useState({});

  useEffect(() => {
    void fetchCart().catch(() => {
      toast.error("Unable to load your cart.");
    });
  }, [fetchCart]);

  async function runGeneration() {
    setGenerating(true);
    setTryOnError(null);

    try {
      const { data } = await generateTryOn();

      setPreviewUrl(data.tryon_image_url);

      const slots = {};
      (data.items || []).forEach((item) => {
        slots[item.product_id] = item.category_slot;
      });
      setSlotByProduct(slots);
    } catch (err) {
      setTryOnError(
        err.response?.data?.detail ?? "Try-On generation failed."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handlePreviewClick() {
    let profile;
    try {
      ({ data: profile } = await getProfile());
    } catch {
      toast.error("Could not load your profile.");
      return;
    }

    if (!profile?.reference_image_url) {
      // No reference photo yet → open the setup modal first.
      setUploadOpen(true);
      return;
    }

    setPreviewOpen(true);
    void runGeneration();
  }

  function handleRegenerate() {
    void runGeneration();
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Loading...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-6">
        <ShoppingBag
          size={70}
          className="text-zinc-300"
        />

        <h2 className="mt-6 text-3xl font-bold">
          Your cart is empty
        </h2>

        <p className="mt-3 text-zinc-500">
          Looks like you haven't added anything yet.
        </p>

        <Link
          to="/products"
          className="mt-8 rounded-xl bg-black px-8 py-3 font-medium text-white"
        >
          Continue Shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:py-12">

      <h1 className="mb-6 sm:mb-10 text-2xl sm:text-4xl font-black">
        Shopping Cart
      </h1>

      <div className="grid gap-6 sm:gap-10 lg:grid-cols-[2fr_1fr]">

        {/* Cart Items */}

        <div className="space-y-4 sm:space-y-6">

          {items.map((item) => (

            <div
              key={item.id}
              className="flex gap-3.5 sm:gap-5 rounded-2xl border p-3.5 sm:p-5"
            >

              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="h-24 w-20 sm:h-32 sm:w-24 shrink-0 rounded-xl object-cover"
              />

              <div className="flex flex-1 flex-col justify-between min-w-0">

                <div>

                  <h3 className="text-base sm:text-xl font-semibold break-words">
                    {item.product.name}
                  </h3>

                  <p className="mt-2 text-zinc-500">
                    ₹{getSellingPrice(item.product)}
                  </p>

                  {item.size && (
                    <p className="mt-1 text-sm text-zinc-500">
                      Size : {item.size.name}
                    </p>
                  )}

                  <div className="mt-3 flex w-fit items-center rounded-lg border">
                    <button
                      onClick={() => {
                        void updateItem(item.id, item.quantity - 1).catch(() => {
                          toast.error("Unable to update quantity.");
                        });
                      }}
                      disabled={item.quantity <= 1}
                      className="w-9 h-9 disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        void updateItem(item.id, item.quantity + 1).catch((err) => {
                          toast.error(
                            err.response?.data?.detail ??
                              "Unable to update quantity."
                          );
                        });
                      }}
                      disabled={item.quantity >= item.product.quantity}
                      className="w-9 h-9 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                </div>

                <button
                  onClick={() => {
                    void removeItem(item.id).catch(() => {
                      toast.error("Unable to remove this item.");
                    });
                  }}
                  className="mt-5 flex w-fit items-center gap-2 text-red-500"
                >
                  <Trash2 size={18} />

                  Remove
                </button>

              </div>

            </div>

          ))}

        </div>

        {/* AI Try-On + Summary */}
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-700 p-6 text-white">
            <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 -left-4 h-32 w-32 rounded-full bg-white/5" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                  <Sparkles size={20} />
                </span>

                <div>
                  <p className="text-lg font-bold">✨ Preview Outfit on Me</p>
                  <p className="mt-0.5 text-sm text-zinc-300">
                    See your entire cart styled on your photo.
                  </p>
                </div>
              </div>

              <button
                onClick={handlePreviewClick}
                disabled={generating}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating preview...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Try-On Preview
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="h-fit rounded-2xl border p-6">

          <h2 className="text-2xl font-bold">
            Order Summary
          </h2>

          <div className="mt-8 flex justify-between">

            <span>Subtotal</span>

            <span>
              ₹{subtotal()}
            </span>

          </div>

          <div className="mt-4 flex justify-between">

            <span>Shipping</span>

            <span>Free</span>

          </div>

          <hr className="my-6" />

          <div className="flex justify-between text-xl font-bold">

            <span>Total</span>

            <span>
              ₹{subtotal()}
            </span>

          </div>

          <Link
            to="/checkout"
            className="mt-8 flex h-14 items-center justify-center rounded-xl bg-black font-semibold text-white"
          >
            Proceed to Checkout
          </Link>

          </div>
        </div>

        {/* AI Try-On modals */}
        <TryOnReferenceModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onSaved={() => {
            setUploadOpen(false);
            setPreviewOpen(true);
            void runGeneration();
          }}
        />

        <TryOnPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          lines={items.map((item) => ({
            id: item.id,
            productId: item.product.id,
            name: item.product.name,
            imageUrl: item.product.image_url,
            price: getSellingPrice(item.product),
            sizeName: item.size?.name ?? null,
            quantity: item.quantity,
          }))}
          total={subtotal()}
          imageUrl={previewUrl}
          loading={generating}
          error={tryOnError}
          slotByProduct={slotByProduct}
          onRegenerate={handleRegenerate}
          onCheckout={() => navigate("/checkout")}
        />

      </div>

    </section>
  );
}
