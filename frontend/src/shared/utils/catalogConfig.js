// Centralized catalog configuration shared by the admin ProductForm and
// the storefront Collection filters. Keep in sync with backend/schemas/
// product_metadata.py for metadata option lists.

// Size families: each is an ordered list of size NAMES (matched against
// the /sizes API records by name — no database ids are hardcoded here).
export const SIZE_FAMILIES = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL"],
  shirts: ["S", "M", "L", "XL", "XXL"],
  waist: ["28", "30", "32", "34", "36", "38"],
  footwear: ["6", "7", "8", "9", "10", "11"],
};

// Category slug -> size family. Top-level slugs provide the default family
// for their whole subtree; a subcategory slug can override it (e.g. shirts).
// A null family means the category has no specific size system.
export const CATEGORY_SIZE_FAMILY = {
  topwear: "clothing",
  bottomwear: "waist",
  dresses: "clothing",
  footwear: "footwear",
  accessories: null,

  // Per-subcategory overrides
  shirts: "shirts",
};

// Merchandising order for top-level categories on the storefront.
export const CATEGORY_DISPLAY_ORDER = [
  "topwear",
  "bottomwear",
  "dresses",
  "footwear",
  "accessories",
];

/**
 * Resolve the size family for a selected category (parent or subcategory).
 * Falls back to the parent's family for subcategories, then to null.
 */
export function getSizeFamilyForCategory(categories, categoryId) {
  if (!categoryId) return null;

  const category = categories.find((c) => c.id === Number(categoryId));
  if (!category) return null;

  if (CATEGORY_SIZE_FAMILY[category.slug] !== undefined) {
    return CATEGORY_SIZE_FAMILY[category.slug];
  }

  if (category.parent_id) {
    const parent = categories.find((c) => c.id === category.parent_id);
    if (parent && CATEGORY_SIZE_FAMILY[parent.slug] !== undefined) {
      return CATEGORY_SIZE_FAMILY[parent.slug];
    }
  }

  return null;
}

/**
 * Filter API size records down to a family, keeping the family's order.
 * Returns all sizes when no family applies (e.g. no category selected).
 */
export function getSizesForFamily(sizes, family) {
  const familyNames = family ? SIZE_FAMILIES[family] : null;
  if (!familyNames) return sizes;

  return familyNames
    .map((name) => sizes.find((s) => s.name === name))
    .filter(Boolean);
}

/**
 * Sort top-level categories into the merchandising order; unknown or
 * child categories keep a stable alphabetical fallback at the end.
 */
export function sortCategoriesByDisplayOrder(categories) {
  const rank = (slug) => {
    const index = CATEGORY_DISPLAY_ORDER.indexOf(slug);
    return index === -1 ? CATEGORY_DISPLAY_ORDER.length : index;
  };

  return [...categories].sort(
    (a, b) =>
      rank(a.slug) - rank(b.slug) || a.name.localeCompare(b.name)
  );
}