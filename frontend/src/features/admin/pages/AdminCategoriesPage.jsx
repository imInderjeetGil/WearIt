import { useCallback, useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../catalog/api/categories";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
  });

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await getCategories();
      setCategories(data);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function openCreate() {
    setEditingCategory(null);
    setForm({ name: "", slug: "" });
    setShowForm(true);
  }

  function openEdit(category) {
    setEditingCategory(category);
    setForm({ name: category.name, slug: category.slug });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingCategory(null);
    setForm({ name: "", slug: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, form);
        toast.success("Category updated");
      } else {
        await createCategory(form);
        toast.success("Category created");
      }
      closeForm();
      void fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Something went wrong");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this category?")) return;

    try {
      setDeletingId(id);
      await deleteCategory(id);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Admin</p>
          <h1 className="mt-2 text-4xl font-black">Categories</h1>
        </div>
        <button
          onClick={openCreate}
          className="h-12 px-6 rounded-xl bg-black text-white font-semibold hover:bg-zinc-800 transition"
        >
          <Plus size={20} className="mr-2" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-zinc-200 rounded w-1/4" />
            <div className="h-12 bg-zinc-200 rounded w-1/4" />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="p-4 text-left font-semibold text-zinc-600">Name</th>
                  <th className="p-4 text-left font-semibold text-zinc-600">Slug</th>
                  <th className="p-4 text-left font-semibold text-zinc-600">Products</th>
                  <th className="p-4 text-right font-semibold text-zinc-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-zinc-50">
                    <td className="p-4 font-medium">{category.name}</td>
                    <td className="p-4 text-zinc-600 font-mono text-sm">{category.slug}</td>
                    <td className="p-4 text-zinc-500">{category.products?.length || 0}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(category)}
                          className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition"
                          title="Edit"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          disabled={deletingId === category.id}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          {deletingId === category.id ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {categories.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
              <p>No categories yet</p>
              <button
                onClick={openCreate}
                className="mt-4 inline-block text-black font-semibold hover:underline"
              >
                Create your first category
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-6 text-2xl font-black">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Category Name"
                  className="h-12 w-full rounded-xl border px-4"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Slug (URL)</label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="category-slug"
                  className="h-12 w-full rounded-xl border px-4"
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 h-12 rounded-xl border font-semibold hover:bg-zinc-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-black text-white font-semibold hover:bg-zinc-800 transition"
                >
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}