import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getCategories } from "../../api/categories";
import { getSizes } from "../../api/sizes";
import {
  getSizeFamilyForCategory,
  getSizesForFamily,
  sortCategoriesByDisplayOrder,
} from "../../../../shared/utils/catalogConfig";

export default function FilterSidebar({
  setMinPrice,
  setMaxPrice,
  categoryId,
  setCategoryId,
  sizeId,
  setSizeId,
  clearFilters,
}) {
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);

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

  useEffect(() => {
    void loadCategories();
    void loadSizes();
  }, [loadCategories, loadSizes]);

  // One-level hierarchy: group children under their top-level parent.
  const topLevelCategories = sortCategoriesByDisplayOrder(
    categories.filter((category) => !category.parent_id)
  );

  const topLevelIds = new Set(topLevelCategories.map((c) => c.id));

  const childrenByParent = {};
  const orphanCategories = [];

  for (const category of categories) {
    if (!category.parent_id) continue;

    if (topLevelIds.has(category.parent_id)) {
      (childrenByParent[category.parent_id] ||= []).push(category);
    } else {
      // Defensive: a child whose parent is missing still renders at root.
      orphanCategories.push(category);
    }
  }

  function toggleExpanded(id) {
    setExpandedIds((prev) =>
      prev.includes(id)
        ? prev.filter((value) => value !== id)
        : [...prev, id]
    );
  }

  // The relevant size family depends on the selected category/subcategory.
  // With no category context (All) or a category without a size system
  // (e.g. Accessories) the whole SIZE section is hidden.
  const sizeFamily = getSizeFamilyForCategory(categories, categoryId);
  const showSizeFilter = Boolean(sizeFamily);
  const availableSizes = getSizesForFamily(sizes, sizeFamily);

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

    {topLevelCategories.map((category) => {

      const children = childrenByParent[category.id] || [];
      const isExpanded = expandedIds.includes(category.id);

      return (

        <div key={category.id}>

          <div className="flex items-center gap-1">

            {children.length > 0 ? (

              <button
                type="button"
                onClick={() => toggleExpanded(category.id)}
                aria-label={
                  isExpanded
                    ? `Collapse ${category.name}`
                    : `Expand ${category.name}`
                }
                className="p-0.5 rounded hover:bg-zinc-100 transition"
              >

                {isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}

              </button>

            ) : (
              <span className="w-5" />
            )}

            <label className="flex items-center gap-3 cursor-pointer">

              <input
                type="radio"
                checked={categoryId === category.id}
                onChange={() => setCategoryId(category.id)}
              />

              <span>{category.name}</span>

            </label>

          </div>

          {isExpanded && children.length > 0 && (

            <div className="ml-7 mt-3 space-y-3">

              {children.map((child) => (

                <label
                  key={child.id}
                  className="flex items-center gap-3 cursor-pointer"
                >

                  <input
                    type="radio"
                    checked={categoryId === child.id}
                    onChange={() => setCategoryId(child.id)}
                  />

                  <span>{child.name}</span>

                </label>

              ))}

            </div>

          )}

        </div>

      );

    })}

    {/* Defensive: children whose parent is missing render at root level */}
    {orphanCategories.map((category) => (

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

      {/* Size (category-aware; hidden entirely when no size system applies) */}
      {showSizeFilter && (
      <div>

  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
    Size
  </h3>

  <div className="flex flex-wrap gap-2">

    {availableSizes.map((size) => (

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
      )}
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