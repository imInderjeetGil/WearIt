import { useCallback, useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Star, Heart } from "lucide-react";
import { getProduct, deleteProduct } from "../api/products";
import { recordInteraction } from "../../interactions/api/interactions";
import ReviewSection from "../../reviews/components/ReviewSection";
import TryOnComingSoon from "../../../shared/components/TryOnComingSoon";
import { toast } from "react-hot-toast";
import useCartStore from "../../cart/store/cart-store";
import { useAuth } from "../../auth/context/auth-context";
import { getWishlistIds, toggleWishlist } from "../../wishlist/api/wishlist";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({
    average: 0,
    count: 0,
  });
  const [wishlisted, setWishlisted] = useState(false);

  async function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: location.pathname },
      });
      return;
    }

    const previous = wishlisted;
    setWishlisted(!previous);

    try {
      const { data } = await toggleWishlist(product.id);
      setWishlisted(data.wishlisted);
    } catch (err) {
      console.error(err);
      setWishlisted(previous);
      toast.error("Something went wrong");
    }
  }

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: location.pathname },
      });
      return;
    }

    try {
      await addItem(product.id, selectedSize.size.id, quantity);
      toast.success("Added to cart");
    } catch (err) {
      toast.error(
        err.response?.data?.detail ?? "Failed to add to cart"
      );
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true);
      await deleteProduct(id);
      toast.success("Product deleted");
      navigate("/admin-panel/products");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete product");
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getProduct(id);
      setProduct(data);
      setQuantity(1);

      if (isAuthenticated) {
        void recordInteraction(data.id, "view");
      }

      if (data.sizes?.length > 0) {
        setSelectedSize(data.sizes[0]);
      }

      if (isAuthenticated) {
        try {
          const { data: wishlistIds } = await getWishlistIds();
          setWishlisted(wishlistIds.includes(data.id));
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    void fetchProduct();
  }, [fetchProduct]);

  if (loading) {
    return (
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10 animate-pulse">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-square bg-zinc-200 rounded-2xl" />
          <div className="space-y-6">
            <div className="h-4 w-24 bg-zinc-200 rounded" />
            <div className="h-10 w-80 bg-zinc-200 rounded" />
            <div className="h-8 w-40 bg-zinc-200 rounded" />
            <div className="space-y-3">
              <div className="h-4 bg-zinc-200 rounded" />
              <div className="h-4 bg-zinc-200 rounded" />
              <div className="h-4 w-3/4 bg-zinc-200 rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold">Product not found</h2>
      </section>
    );
  }

  return (
    <>
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          
          {/* Image */}
          <div className="aspect-square bg-zinc-100 overflow-hidden rounded-2xl border border-zinc-100">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details Column */}
          <div className="flex flex-col space-y-6">
            
            {/* Category, Title + Wishlist Icon Row, Brand */}
            <div className="space-y-2">
              <p className="uppercase tracking-[0.25em] text-xs font-bold text-zinc-400">
                {product.category?.name ?? "Uncategorized"}
              </p>

              {/* Title & Wishlist Button Inline */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 leading-tight tracking-tight break-words">
                  {product.name}
                </h1>

                {!isAdmin && (
                  <button
                    type="button"
                    onClick={handleWishlist}
                    aria-label="Add to Wishlist"
                    className="flex-shrink-0 mt-1 flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm transition hover:bg-zinc-50 hover:scale-105 active:scale-95"
                  >
                    <Heart
                      size={22}
                      fill={wishlisted ? "currentColor" : "none"}
                      className={wishlisted ? "text-red-500" : "text-zinc-600"}
                    />
                  </button>
                )}
              </div>

              <p className="text-sm font-semibold text-zinc-500 tracking-wide">
                {product.brand}
              </p>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-4 pt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-zinc-900">
                ₹{product.discount_price ?? product.price}
              </span>
              {product.discount_price && (
                <span className="text-xl line-through text-zinc-400 font-medium">
                  ₹{product.price}
                </span>
              )}
            </div>

            {/* Rating Summary */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    fill={
                      star <= Math.round(reviewSummary.average)
                        ? "currentColor"
                        : "none"
                    }
                    className="text-yellow-400"
                  />
                ))}
              </div>
              {reviewSummary.count > 0 && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <span className="font-semibold text-zinc-900">
                    {reviewSummary.average.toFixed(1)}
                  </span>
                  <span>
                    ({reviewSummary.count} {reviewSummary.count === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="leading-relaxed text-zinc-600 text-base">
              {product.description}
            </p>

            {/* Sizes */}
            <div className="space-y-3 pt-1">
              <h3 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider">
                Select Size
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes?.map((size) => (
                  <button
                    key={size.size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 min-w-[3.5rem] px-5 rounded-xl border font-semibold text-sm transition-all ${
                      selectedSize?.size.id === size.size.id
                        ? "bg-black text-white border-black shadow-sm"
                        : "border-zinc-200 hover:border-black text-zinc-800"
                    }`}
                  >
                    {size.size.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3 pt-1">
              <h3 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider">
                Quantity
              </h3>
              <div className="flex w-fit items-center border border-zinc-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center font-bold text-lg text-zinc-700 hover:bg-zinc-50 transition"
                >
                  −
                </button>
                <span className="w-12 text-center font-bold text-zinc-900">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.quantity, q + 1))
                  }
                  disabled={quantity >= product.quantity}
                  className="w-12 h-12 flex items-center justify-center font-bold text-lg text-zinc-700 hover:bg-zinc-50 transition disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4">
              {isAdmin ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate(`/admin-panel/products/${id}/edit`)}
                    className="flex-1 h-14 rounded-xl border border-zinc-300 font-semibold text-zinc-900 hover:bg-zinc-50 transition"
                  >
                    Edit Product
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="flex-1 h-14 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                  >
                    Delete Product
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity < 1}
                  className="h-14 w-full rounded-xl bg-black text-white font-semibold hover:bg-zinc-800 transition disabled:bg-zinc-300"
                >
                  {product.quantity < 1 ? "Out of Stock" : "Add To Cart"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Delete Product</h3>
            <p className="text-zinc-600 mb-6 leading-relaxed">
              Are you sure you want to delete "{product.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="h-11 px-5 rounded-xl border border-zinc-300 font-medium text-zinc-700 hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="h-11 px-5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Try-On is intentionally a coming-soon feature (no generation yet). */}
      {!isAdmin && (
        <section className="mx-auto max-w-[1400px] px-4 lg:px-8 pb-10">
          <TryOnComingSoon />
        </section>
      )}

      <ReviewSection
        product={product}
        user={user}
        onSummaryChange={setReviewSummary}
      />
    </>
  );
}