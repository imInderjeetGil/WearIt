import { useCallback, useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getProduct } from "../api/products";
import { deleteProduct } from "../api/products";
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

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: location.pathname,
        },
      });

      return;
    }

    try {
      await addItem(product.id,
    selectedSize.size.id,quantity);

      toast.success("Added to cart");
    } catch (err) {
      toast.error(
        err.response?.data?.detail ??
          "Failed to add to cart"
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

          <div className="space-y-5">

            <div className="h-4 w-24 bg-zinc-200 rounded" />

            <div className="h-10 w-80 bg-zinc-200 rounded" />

            <div className="h-8 w-40 bg-zinc-200 rounded" />

            <div className="space-y-2">
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

        <h2 className="text-3xl font-bold">
          Product not found
        </h2>

      </section>
    );
  }

  return (
    <>
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 sm:py-10">

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">

          {/* Image */}

          <div>

            <div className="aspect-square bg-zinc-100 overflow-hidden rounded-2xl">

              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />

            </div>

          </div>

          <div>

            <p className="uppercase tracking-[0.3em] text-xs text-zinc-500">

              {product.category?.name ?? "Uncategorized"}

            </p>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black mt-2 sm:mt-3 break-words">

              {product.name}

            </h1>

            <p className="mt-2 text-zinc-500">

              {product.brand}

            </p>

            <div className="flex items-center gap-4 mt-8">

              <span className="text-3xl font-bold">

                ₹{product.discount_price ?? product.price}

              </span>

              {product.discount_price && (

                <span className="text-xl line-through text-zinc-400">

                  ₹{product.price}

                </span>

              )}

            </div>

            <p className="mt-8 leading-8 text-zinc-600">

              {product.description}

            </p>

            {/* Sizes */}

            <div className="mt-10">

              <h3 className="font-semibold mb-4">

                Select Size

              </h3>

              <div className="flex flex-wrap gap-3">

                {product.sizes?.map((size) => (

                  <button
                    key={size.size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 min-w-12 px-5 rounded-lg border transition

                    ${
                      selectedSize?.size.id === size.size.id
                        ? "bg-black text-white border-black"
                        : "hover:border-black"
                    }`}
                  >

                    {size.size.name}

                  </button>

                ))}

              </div>

            </div>

            {/* Quantity */}

            <div className="mt-10">

              <h3 className="font-semibold mb-4">

                Quantity

              </h3>

              <div className="flex w-fit items-center border rounded-lg">

                <button
                  onClick={() =>
                    setQuantity((q) => Math.max(1, q - 1))
                  }
                  className="w-12 h-12"
                >
                  −
                </button>

                <span className="w-14 text-center">

                  {quantity}

                </span>

                <button
                  onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                  disabled={quantity >= product.quantity}
                  className="w-12 h-12"
                >
                  +
                </button>

              </div>

            </div>

            {/* Button */}

            {isAdmin ? (
              <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => navigate(`/admin-panel/products/${id}/edit`)}
                  className="flex-1 h-14 rounded-xl border border-zinc-300 font-semibold hover:bg-zinc-50 transition"
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
                className="mt-12 h-14 w-full rounded-xl bg-black text-white font-semibold hover:bg-zinc-800 transition"
              >

                {product.quantity < 1 ? "Out of Stock" : "Add To Cart"}

              </button>
            )}

          </div>

        </div>

      </section>

      

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md mx-4 rounded-2xl bg-white p-6">
            <h3 className="text-xl font-bold mb-2">Delete Product</h3>
            <p className="text-zinc-600 mb-6">
              Are you sure you want to delete "{product.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="h-12 px-6 rounded-xl border border-zinc-300 font-medium hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="h-12 px-6 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50"
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
    </>
  );
}