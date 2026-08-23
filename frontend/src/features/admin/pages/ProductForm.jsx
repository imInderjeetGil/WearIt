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
import {
  getSizeFamilyForCategory,
  getSizesForFamily,
} from "../../../shared/utils/catalogConfig";

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
const PATTERNS = ["Solid", "Striped", "Checked", "Floral", "Printed", "Graphic", "Camo", "Plain","Embroidered"];
const SEASONS = ["Summer", "Winter", "Monsoon", "Autumn", "Spring", "All Season"];
const OCCASIONS = ["Casual", "Formal", "Party", "Sports", "Office", "Ethnic", "Streetwear","Wedding","Festive"];
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

function MultiSelectChips({ label, name, value, onChange, options }) {
  function toggle(option) {
    onChange({
      target: {
        name,
        value: value.includes(option)
          ? value.filter((v) => v !== option)
          : [...value, option],
      },
    });
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`
              rounded-lg
              border
              px-4
              py-2
              text-sm
              transition

              ${
                value.includes(option)
                  ? "bg-black text-white border-black"
                  : "hover:bg-zinc-100"
              }
            `}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

const toArray = (value) =>
  Array.isArray(value) ? value : value ? [value] : [];

export default function ProductForm() {
  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);

  // Parent category drives the subcategory options (one-level hierarchy).
  const [selectedParentId, setSelectedParentId] = useState("");


  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discount_price: "",
    category_id: "",
    image_url: "",
    brand: "",
    // Non-sized inventory: single product-level stock quantity
    quantity: "",
    // Per-size inventory (sized categories): [{ size_id, stock }]
    sizes: [],
    product_metadata: {
      fit_type: "",
      gender_target: "",
      color: "",
      material: "",
      pattern: "",
      season: [],
      occasion: [],
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


  const topLevelCategories = categories.filter(
    (category) => !category.parent_id
  );

  const subcategories = selectedParentId
    ? categories.filter(
        (category) => category.parent_id === Number(selectedParentId)
      )
    : [];

  const selectedParent = topLevelCategories.find(
    (category) => String(category.id) === String(selectedParentId)
  );

  // Available sizes depend on the selected category (leaf, or the parent
  // while no subcategory has been chosen yet).
  const sizeFamily = getSizeFamilyForCategory(
    categories,
    form.category_id || selectedParentId
  );
  const availableSizes = getSizesForFamily(sizes, sizeFamily);

  // A null size family means the category has no size system (e.g.
  // Accessories): those products use a single product-level quantity.
  const categorySelected = Boolean(selectedParentId || form.category_id);
  const isSizedCategory = Boolean(sizeFamily);

  const totalStock = form.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);

  function pruneSizes(categoryId) {
    const family = getSizeFamilyForCategory(categories, categoryId);

    // Non-sized categories have no size system: clear any selected sizes.
    if (!family) {
      setForm((prev) => ({ ...prev, sizes: [] }));
      return;
    }

    const availableIds = new Set(
      getSizesForFamily(sizes, family).map((s) => s.id)
    );

    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => availableIds.has(s.size_id)),
    }));
  }

  function handleParentChange(e) {
    const parentId = e.target.value;

    setSelectedParentId(parentId);

    if (!parentId) {
      setForm((prev) => ({ ...prev, category_id: "", sizes: [] }));
      return;
    }

    const children = categories.filter(
      (category) => category.parent_id === Number(parentId)
    );

    // A parent with no subcategories is used as the category itself.
    const categoryId = children.length === 0 ? parentId : "";

    setForm((prev) => ({ ...prev, category_id: categoryId }));
    pruneSizes(categoryId || parentId);
  }

  function handleSubcategoryChange(e) {
    const categoryId = e.target.value;

    setForm((prev) => ({ ...prev, category_id: categoryId }));
    pruneSizes(categoryId);
  }

  function toggleSize(sizeId) {
    setForm((prev) => {
      const exists = prev.sizes.some((s) => s.size_id === sizeId);

      return {
        ...prev,
        sizes: exists
          ? prev.sizes.filter((s) => s.size_id !== sizeId)
          : [...prev.sizes, { size_id: sizeId, stock: 0 }],
      };
    });
  }

  function updateSizeStock(sizeId, stock) {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) =>
        s.size_id === sizeId ? { ...s, stock: Number(stock) || 0 } : s
      ),
    }));
  }


  const loadProduct = useCallback(async () => {
    try {
      const { data } = await getProduct(id);

      // Derive the parent selection from the product's category so the
      // subcategory dropdown shows the right options when editing.
      const loadedCategory = data.category;
      setSelectedParentId(
        loadedCategory
          ? String(loadedCategory.parent_id ?? loadedCategory.id)
          : ""
      );

      setForm({
        name: data.name,
        description: data.description,
        price: data.price,
        discount_price: data.discount_price || "",
        category_id: data.category_id || "",
        image_url: data.image_url || "",
        brand: data.brand || "",
        quantity: data.quantity ?? 0,
        sizes: data.sizes?.map((s) => ({
          size_id: s.size.id,
          stock: s.stock,
        })) || [],
        product_metadata: {
          fit_type: data.product_metadata?.fit_type ?? "",
          gender_target: data.product_metadata?.gender_target ?? "",
          color: data.product_metadata?.color ?? "",
          material: data.product_metadata?.material ?? "",
          pattern: data.product_metadata?.pattern ?? "",
          season: toArray(data.product_metadata?.season),
          occasion: toArray(data.product_metadata?.occasion),
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

    if (!form.category_id) {
      toast.error("Please select a subcategory");
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      category_id: form.category_id ? Number(form.category_id) : null,
      brand: form.brand || null,
      // Sized products derive total stock from per-size stock server-side;
      // non-sized products use this product-level quantity directly.
      quantity: Number(form.quantity) || 0,
      sizes: isSizedCategory ? form.sizes : [],
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
        {/* Basic Information */}
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

        {/* Media */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Category / Parent
            </label>
            <select
              name="parent_category"
              value={selectedParentId}
              onChange={handleParentChange}
              className="h-14 w-full rounded-xl border px-4"
              required
            >
              <option value="">Select Category</option>
              {topLevelCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Subcategory
            </label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleSubcategoryChange}
              className="h-14 w-full rounded-xl border px-4 disabled:bg-zinc-100 disabled:text-zinc-400"
              disabled={!selectedParentId || subcategories.length === 0}
            >
              {!selectedParentId ? (
                <option value="">Select a parent category first</option>
              ) : subcategories.length === 0 ? (
                <option value={selectedParentId}>
                  No subcategories — using {selectedParent?.name}
                </option>
              ) : (
                <>
                  <option value="">Select Subcategory</option>
                  {subcategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        {/* Inventory depends on the selected category:
            sized -> per-size stock; non-sized -> one product-level quantity */}
        {isSizedCategory ? (
          <div>
            <label className="mb-2 block text-sm font-medium">
              Sizes & Stock
            </label>

            {availableSizes.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Select a category to see the available sizes
              </p>
            ) : (
              <div className="space-y-2">
                {availableSizes.map((size) => {
                  const entry = form.sizes.find((s) => s.size_id === size.id);
                  const selected = Boolean(entry);

                  return (
                    <div key={size.id} className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-zinc-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleSize(size.id)}
                          className="h-4 w-4 rounded border-zinc-300 text-black focus:ring-black"
                        />
                        {size.name}
                      </label>

                      {selected && (
                        <input
                          type="number"
                          min="0"
                          value={entry.stock}
                          onChange={(e) => updateSizeStock(size.id, e.target.value)}
                          placeholder="Stock"
                          className="h-10 w-28 rounded-lg border px-3"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <p className="mt-2 text-sm text-zinc-500">
              Total stock: {totalStock}
            </p>
          </div>
        ) : (
          <div>
            <label className="mb-2 block text-sm font-medium">
              Inventory
            </label>

            {!categorySelected ? (
              <p className="text-sm text-zinc-500">
                Select a category to set the inventory
              </p>
            ) : (
              <>
                <label className="mb-2 block text-sm font-medium">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="Stock Quantity"
                  className="h-14 w-full rounded-xl border px-4 sm:w-64"
                  required
                  min="0"
                  step="1"
                />
              </>
            )}
          </div>
        )}

        {/* Product Details (AI) */}
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
            <MultiSelectChips
              label="Season"
              name="product_metadata.season"
              value={form.product_metadata.season}
              onChange={handleChange}
              options={SEASONS}
            />
            <MultiSelectChips
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