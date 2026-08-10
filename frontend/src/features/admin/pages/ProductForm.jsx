import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Upload, X } from "lucide-react";

import {
  getProduct,
  createProduct,
  updateProduct,
  //uploadProductImage,
} from "../../catalog/api/products";
import { getCategories } from "../../catalog/api/categories";
import { getSizes } from "../../catalog/api/sizes";
import { uploadProductImage } from "../../catalog/api/upload";

// AI product metadata options — must stay in sync with backend/schemas/product_metadata.py
const FIT_TYPES = ["Slim", "Regular", "Relaxed", "Oversized"];
const GENDER_TARGETS = ["Male", "Female", "Unisex"];
const COLORS = [
  "Black", "White", "Grey", "Blue", "Red", "Green", "Yellow",
  "Pink", "Brown", "Beige", "Navy", "Maroon", "Orange", "Purple", "Multi",
];
const MATERIALS = [
  "Cotton", "Polyester", "Denim", "Wool", "Silk", "Linen",
  "Nylon", "Rayon", "Leather", "Blended",
];
const PATTERNS = ["Solid", "Striped", "Checked", "Floral", "Printed", "Graphic", "Camo", "Plain"];
const SEASONS = ["Summer", "Winter", "Monsoon", "Autumn", "Spring", "All Season"];
const OCCASIONS = ["Casual", "Formal", "Party", "Sports", "Office", "Ethnic", "Streetwear"];
const STYLES = ["Minimal", "Streetwear", "Casual", "Formal", "Vintage", "Sport", "Luxury"];

function MetadataSelect({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-14 w-full rounded-xl border px-4"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ProductForm() {
  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);


  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discount_price: "",
    quantity: "",
    category_id: "",
    image_url: "",
    brand: "",
    sizes: [],
    product_metadata: {
      fit_type: "",
      gender_target: "",
      color: "",
      material: "",
      pattern: "",
      season: "",
      occasion: "",
      style: "",
    },
  });

  const [imagePreview, setImagePreview] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      const { data } = await getCategories();

      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadSizes = useCallback(async () => {
    try {
      const { data } = await getSizes();

      setSizes(data);
    } catch (err) {
      console.error(err);
    }
  }, []);


  const loadProduct = useCallback(async () => {
    try {
      const { data } = await getProduct(id);

      setForm({
        name: data.name,
        description: data.description,
        price: data.price,
        discount_price: data.discount_price || "",
        quantity: data.quantity,
        category_id: data.category_id || "",
        image_url: data.image_url || "",
        brand: data.brand || "",
        sizes: data.sizes?.map((s) => s.size.id) || [],
        product_metadata: {
          fit_type: data.product_metadata?.fit_type ?? "",
          gender_target: data.product_metadata?.gender_target ?? "",
          color: data.product_metadata?.color ?? "",
          material: data.product_metadata?.material ?? "",
          pattern: data.product_metadata?.pattern ?? "",
          season: data.product_metadata?.season ?? "",
          occasion: data.product_metadata?.occasion ?? "",
          style: data.product_metadata?.style ?? "",
        },
      });

      if (data.image_url) {
        setImagePreview(data.image_url);
      }
    } catch {
      toast.error("Product not found");
    }
  }, [id]);

  useEffect(() => {
    void loadCategories();
    void loadSizes();
    if (isEdit) {
      void loadProduct();
    }
  }, [isEdit, loadCategories, loadSizes, loadProduct]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("product_metadata.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        product_metadata: { ...prev.product_metadata, [key]: value },
      }));
      return;
    }

    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: checked
          ? [...prev[name], Number(value)]
          : prev[name].filter((v) => v !== Number(value)),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    try {
      setUploadingImage(true);

      const data = await uploadProductImage(file);

setForm((prev) => ({
    ...prev,
    image_url: data.image_url,
}));

setImagePreview(data.image_url);

      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  function removeImage() {
    setForm((prev) => ({ ...prev, image_url: "" }));
    setImagePreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      ...form,
      price: Number(form.price),
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      quantity: Number(form.quantity),
      category_id: form.category_id ? Number(form.category_id) : null,
      brand: form.brand || null,
      sizes: form.sizes,
      product_metadata: form.product_metadata,
    };

    try {
      setLoading(true);

      if (isEdit) {
        await updateProduct(id, payload);

        toast.success("Product updated");
      } else {
        await createProduct(payload);

        toast.success("Product created");
      }

      navigate("/admin-panel/products");
    } catch (err) {
      toast.error(
        err.response?.data?.detail ?? "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <h1 className="mb-6 sm:mb-8 text-2xl sm:text-4xl font-black">
        {isEdit ? "Edit Product" : "Add Product"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Product Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Product Name"
            className="h-14 w-full rounded-xl border px-4"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="h-40 w-full rounded-xl border p-4"
            required
          />
        </div>

        {/* Brand */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Brand
          </label>
          <input
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="Brand (optional)"
            className="h-14 w-full rounded-xl border px-4"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Product Image
          </label>
          <div className="space-y-4">
            <label className="flex cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
              <div className=" relative
    flex
    h-80
    md:h-96
    w-full
    items-center
    justify-center
    overflow-hidden
    rounded-xl
    border-2
    border-dashed
    border-zinc-300
    transition
    hover:border-black">
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 rounded-full bg-black/80 p-1 text-white hover:bg-black transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <Upload size={32} />
                    <p className="font-medium">Click to upload</p>
                    <p className="text-sm">or drag and drop</p>
                    <p className="text-xs">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
              {uploadingImage && (
                <div className="h-2 w-full rounded bg-zinc-200">
                  <div
                    className="h-full w-1/3 rounded bg-black animate-ping"
                  />
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Category
          </label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="h-14 w-full rounded-xl border px-4"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Price (₹)
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              className="h-14 w-full rounded-xl border px-4"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Discount Price (₹)
            </label>
            <input
              type="number"
              name="discount_price"
              value={form.discount_price}
              onChange={handleChange}
              placeholder="Discount Price (optional)"
              className="h-14 w-full rounded-xl border px-4"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Stock Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="Stock quantity"
              className="h-14 w-full rounded-xl border px-4"
              required
              min="0"
            />
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Sizes
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <label
                key={size.id}
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-zinc-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="sizes"
                  value={size.id}
                  checked={form.sizes.includes(size.id)}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-zinc-300 text-black focus:ring-black"
                />
                {size.name}
              </label>
            ))}
          </div>
        </div>

        {/* AI Product Metadata */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-500 uppercase tracking-wider">
            Product Details (AI)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetadataSelect
              label="Fit"
              name="product_metadata.fit_type"
              value={form.product_metadata.fit_type}
              onChange={handleChange}
              options={FIT_TYPES}
            />
            <MetadataSelect
              label="Gender"
              name="product_metadata.gender_target"
              value={form.product_metadata.gender_target}
              onChange={handleChange}
              options={GENDER_TARGETS}
            />
            <MetadataSelect
              label="Color"
              name="product_metadata.color"
              value={form.product_metadata.color}
              onChange={handleChange}
              options={COLORS}
            />
            <MetadataSelect
              label="Material"
              name="product_metadata.material"
              value={form.product_metadata.material}
              onChange={handleChange}
              options={MATERIALS}
            />
            <MetadataSelect
              label="Pattern"
              name="product_metadata.pattern"
              value={form.product_metadata.pattern}
              onChange={handleChange}
              options={PATTERNS}
            />
            <MetadataSelect
              label="Season"
              name="product_metadata.season"
              value={form.product_metadata.season}
              onChange={handleChange}
              options={SEASONS}
            />
            <MetadataSelect
              label="Occasion"
              name="product_metadata.occasion"
              value={form.product_metadata.occasion}
              onChange={handleChange}
              options={OCCASIONS}
            />
            <MetadataSelect
              label="Style"
              name="product_metadata.style"
              value={form.product_metadata.style}
              onChange={handleChange}
              options={STYLES}
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="h-14 w-full rounded-xl bg-black text-white font-semibold"
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