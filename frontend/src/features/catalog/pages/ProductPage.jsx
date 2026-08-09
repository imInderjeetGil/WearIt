import { useCallback, useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Star } from "lucide-react";
import { getProduct, deleteProduct } from "../api/products";
import ReviewSection from "../../reviews/components/ReviewSection";
import { toast } from "react-hot-toast";
import useCartStore from "../../cart/store/cart-store";
import { useAuth } from "../../auth/context/auth-context";

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

      if (data.sizes?.length > 0) {
        setSelectedSize(data.sizes[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchProduct();
  }, [fetchProduct]);

  if (loading) {
    return (
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10 animate-pulse">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-square bg-zinc-200 rounded-xl" />
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
          <div>
            <div className="aspect-square bg-zinc-100 overflow-hidden rounded-2xl border border-zinc-100">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details Column with explicit vertical spacing */}
          <div className="flex flex-col space-y-6">
            {/* Header / Titles */}
            <div className="space-y-2">
              <p className="uppercase tracking-[0.25em] text-xs font-semibold text-zinc-400">
                {product.category?.name ?? "Uncategorized"}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 leading-tight break-words">
                {product.name}
              </h1>
              <p className="text-sm font-medium text-zinc-500 tracking-wide">
                {product.brand}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-3xl font-extrabold text-zinc-900">
                ₹{product.discount_price ?? product.price}
              </span>
              {product.discount_price && (
                <span className="text-xl line-through text-zinc-400 font-medium">
                  ₹{product.price}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="leading-relaxed text-zinc-600 text-base py-1">
              {product.description}
            </p>

            {/* Rating Section */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
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

            {/* Sizes */}
            <div className="pt-2">
              <h3 className="font-semibold text-zinc-900 mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes?.map((size) => (
                  <button
                    key={size.size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 min-w-[3rem] px-5 rounded-lg border font-medium text-sm transition-all ${
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
            <div className="pt-2">
              <h3 className="font-semibold text-zinc-900 mb-3">Quantity</h3>
              <div className="flex w-fit items-center border border-zinc-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center font-semibold hover:bg-zinc-50 transition"
                >
                  −
                </button>
                <span className="w-12 text-center font-medium text-zinc-800">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.quantity, q + 1))
                  }
                  disabled={quantity >= product.quantity}
                  className="w-12 h-12 flex items-center justify-center font-semibold hover:bg-zinc-50 transition disabled:opacity-40"
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

      <ReviewSection
        product={product}
        user={user}
        onSummaryChange={setReviewSummary}
      />
    </>
  );
}