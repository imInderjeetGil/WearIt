import { useCallback, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Edit2, Trash2, Loader2, ExternalLink, Search, Filter } from "lucide-react";
import { toast } from "react-hot-toast";

import { getProducts, deleteProduct } from "../../catalog/api/products";
import { getCategories } from "../../catalog/api/categories";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        getProducts({ page: 1, limit: 100 }),
        getCategories(),
      ]);

      const prodList = Array.isArray(prodRes.data)
        ? prodRes.data
        : prodRes.data?.products || prodRes.data?.items || prodRes.data?.data || [];
      setProducts(prodList);

      const catList = Array.isArray(catRes.data) ? catRes.data : catRes.data || [];
      setCategories(catList);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      setDeletingId(id);
      await deleteProduct(id);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  }

  // Filtered Products Memoized Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Search Query Filter (Matches Name or ID)
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(product.id).includes(searchQuery);

      // 2. Category Filter (Matches Category ID)
      const matchesCategory =
        selectedCategory === "all" ||
        String(product.category_id) === String(selectedCategory) ||
        String(product.category?.id) === String(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Admin</p>
          <h1 className="mt-1 text-2xl sm:text-4xl font-black">Products</h1>
        </div>
        <Link
          to="/admin-panel/products/new"
          className="flex h-12 items-center justify-center px-6 rounded-xl bg-black text-white font-semibold hover:bg-zinc-800 transition"
        >
          Add Product
        </Link>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search products by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Category Dropdown Filter */}
        <div className="relative min-w-[200px]">
          <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-12 w-full appearance-none rounded-xl border bg-white pl-11 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-zinc-200 rounded w-1/4" />
            <div className="h-12 bg-zinc-200 rounded w-1/4" />
            <div className="h-12 bg-zinc-200 rounded w-1/4" />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border bg-white overflow-hidden">
          {/* Mobile Card View */}
          <div className="block lg:hidden divide-y divide-zinc-100">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{product.name}</p>
                    <p className="text-xs text-zinc-500">
                      {product.category?.name || "Uncategorized"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <span className="font-bold">
                      ₹{product.discount_price ?? product.price}
                    </span>
                    {product.discount_price && (
                      <span className="ml-2 line-through text-zinc-400">
                        ₹{product.price}
                      </span>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.quantity === 0
                        ? "bg-red-100 text-red-800"
                        : product.quantity < 10
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {product.quantity === 0
                      ? "Out of Stock"
                      : product.quantity < 10
                      ? "Low Stock"
                      : `${product.quantity} in stock`}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Link
                    to={`/admin-panel/products/${product.id}/edit`}
                    className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                    title="Delete"
                  >
                    {deletingId === product.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                  <a
                    href={`/products/${product.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition"
                    title="View on Store"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="p-4 text-left font-semibold text-zinc-600">Product</th>
                  <th className="p-4 text-left font-semibold text-zinc-600">Category</th>
                  <th className="p-4 text-left font-semibold text-zinc-600">Price</th>
                  <th className="p-4 text-left font-semibold text-zinc-600">Stock</th>
                  <th className="p-4 text-left font-semibold text-zinc-600">Status</th>
                  <th className="p-4 text-right font-semibold text-zinc-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-zinc-500">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {product.category?.name || "Uncategorized"}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold">
                        ₹{product.discount_price ?? product.price}
                      </span>
                      {product.discount_price && (
                        <span className="ml-2 text-sm line-through text-zinc-400">
                          ₹{product.price}
                        </span>
                      )}
                    </td>
                    <td className="p-4">{product.quantity}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.quantity === 0
                            ? "bg-red-100 text-red-800"
                            : product.quantity < 10
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {product.quantity === 0
                          ? "Out of Stock"
                          : product.quantity < 10
                          ? "Low Stock"
                          : "In Stock"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin-panel/products/${product.id}/edit`}
                          className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition"
                          title="Edit"
                        >
                          <Edit2 size={20} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          {deletingId === product.id ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </button>
                        <a
                          href={`/products/${product.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition"
                          title="View on Store"
                        >
                          <ExternalLink size={20} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
              <p>No products found matching your filters</p>
              {products.length === 0 ? (
                <Link
                  to="/admin-panel/products/new"
                  className="mt-4 inline-block text-black font-semibold hover:underline"
                >
                  Create your first product
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-4 inline-block text-black font-semibold hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}