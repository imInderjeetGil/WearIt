import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getProduct, createProduct, updateProduct } from "../../api/products";
import { getCategories } from "../../api/categories";

export default function ProductForm() {
  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image_url: "",
  });

  useEffect(() => {
    loadCategories();

    if (isEdit) {
      loadProduct();
    }
  }, []);

  async function loadCategories() {
    try {
      const { data } = await getCategories();

      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadProduct() {
    try {
      const { data } = await getProduct(id);

      setForm({
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        category_id: data.category_id,
        image_url: data.image_url,
      });
    } catch (err) {
      toast.error("Product not found");
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      if (isEdit) {
        await updateProduct(id, form);

        toast.success("Product updated");
      } else {
        await createProduct(form);

        toast.success("Product created");
      }

      navigate("/products");
    } catch (err) {
      toast.error(
        err.response?.data?.detail ??
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl">

      <h1 className="mb-8 text-4xl font-black">

        {isEdit
          ? "Edit Product"
          : "Add Product"}

      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="h-14 w-full rounded-xl border px-4"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="h-40 w-full rounded-xl border p-4"
        />

        <input
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="Image URL"
          className="h-14 w-full rounded-xl border px-4"
        />

        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          className="h-14 w-full rounded-xl border px-4"
        >
          <option value="">
            Select Category
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-4">

          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            className="h-14 rounded-xl border px-4"
          />

          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            placeholder="Stock"
            className="h-14 rounded-xl border px-4"
          />

        </div>

        <button
          disabled={loading}
          className="
            h-14
            w-full
            rounded-xl
            bg-black
            text-white
            font-semibold
          "
        >

          {loading
            ? "Saving..."
            : isEdit
              ? "Update Product"
              : "Create Product"}

        </button>

      </form>

    </section>
  );
}