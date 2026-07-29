import { useEffect, useState } from "react";
import { getCategories } from "../../api/categories";

export default function FilterSidebar({
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  categoryId,
  setCategoryId,
  sizeId,
  setSizeId,
  clearFilters,
}) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const { data } = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }

  const sizes = [
    { id: 1, name: "XS" },
    { id: 2, name: "S" },
    { id: 3, name: "M" },
    { id: 4, name: "L" },
    { id: 5, name: "XL" },
  ];
  return (
    <aside className="space-y-8">

      {/* Category */}
     <div>

  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
    Category
  </h3>

  <div className="space-y-3">

    <label className="flex items-center gap-3 cursor-pointer">

      <input
        type="radio"
        checked={categoryId === null}
        onChange={() => setCategoryId(null)}
      />

      <span>All</span>

    </label>

    {categories.map((category) => (

      <label
        key={category.id}
        className="flex items-center gap-3 cursor-pointer"
      >

        <input
          type="radio"
          checked={categoryId === category.id}
          onChange={() => setCategoryId(category.id)}
        />

        <span>{category.name}</span>

      </label>

    ))}

  </div>

</div>

      {/* Price */}
      <div>

        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
          Price
        </h3>

        <div className="space-y-3">

          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="price"
              onChange={() => {
                setMinPrice(null);
                setMaxPrice(1000);
              }}
            />
            <span>Under ₹1000</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="price"
              onChange={() => {
                setMinPrice(1000);
                setMaxPrice(2500);
              }}
            />
            <span>₹1000 - ₹2500</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="price"
              onChange={() => {
                setMinPrice(2500);
                setMaxPrice(5000);
              }}
            />
            <span>₹2500 - ₹5000</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="price"
              onChange={() => {
                setMinPrice(5000);
                setMaxPrice(null);
              }}
            />
            <span>Above ₹5000</span>
          </label>

        </div>

      </div>

      {/* Size */}
      <div>

  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
    Size
  </h3>

  <div className="flex flex-wrap gap-2">

    {sizes.map((size) => (

      <button
        key={size.id}
        onClick={() =>
          setSizeId(
            sizeId === size.id
              ? null
              : size.id
          )
        }
        className={`
          rounded-md
          border
          px-4
          py-2
          transition

          ${
            sizeId === size.id
              ? "bg-black text-white border-black"
              : "hover:bg-black hover:text-white"
          }
        `}
      >

        {size.name}

      </button>

    ))}

  </div>

</div>
<button
  onClick={clearFilters}
  className="
    mt-8
    w-full
    rounded-xl
    border
    py-3
    font-medium
    transition
    hover:bg-zinc-100
  "
>
  Clear Filters
</button>
    </aside>
  );
}