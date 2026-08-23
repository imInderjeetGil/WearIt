"""Category-aware inventory rules shared by the product/cart/order services.

Mirrors frontend/src/shared/utils/catalogConfig.js (and the dev seeder):
every category resolves to a size family, and a null family means the
category has no size system (non-sized products).

Inventory rule enforced across the app:
- Sized category   -> ProductSize.stock is the source of truth and
                      Product.quantity stays synchronized as the sum.
- Non-sized        -> Product.quantity is the source of truth and no
                      ProductSize records may exist for the product.
"""

from models.category import Category

# Ordered size-name lists per family (matched against sizes.name).
SIZE_FAMILIES = {
    "clothing": ["XS", "S", "M", "L", "XL", "XXL"],
    "shirts": ["S", "M", "L", "XL", "XXL"],
    "waist": ["28", "30", "32", "34", "36", "38"],
    "footwear": ["6", "7", "8", "9", "10", "11"],
}

# Category slug -> size family. Top-level slugs provide the default family
# for their whole subtree; a subcategory slug can override it. A null family
# means the category has no size system (accessories: belts, caps, watches,
# bags, jewelry, ...).
CATEGORY_SIZE_FAMILY = {
    "topwear": "clothing",
    "bottomwear": "waist",
    "dresses": "clothing",
    "footwear": "footwear",
    "accessories": None,

    # Per-subcategory overrides
    "t-shirts": "clothing",
    "shirts": "shirts",
    "hoodies": "clothing",
    "jackets": "clothing",
    "kurtas": "clothing",
    "jeans": "waist",
    "trousers": "waist",
    "shorts": "waist",
    "skirts": "waist",
    "leggings": "waist",
    "maxi": "clothing",
    "midi": "clothing",
    "mini": "clothing",
    "bodycon": "clothing",
    "wrap": "clothing",
    "sneakers": "footwear",
    "sandals": "footwear",
    "boots": "footwear",
    "heels": "footwear",
}


def get_size_family_for_category(category: Category | None) -> str | None:
    """Resolve the size family for a category, falling back to its parent."""
    if category is None:
        return None

    if category.slug in CATEGORY_SIZE_FAMILY:
        return CATEGORY_SIZE_FAMILY[category.slug]

    parent = category.parent
    if parent is not None and parent.slug in CATEGORY_SIZE_FAMILY:
        return CATEGORY_SIZE_FAMILY[parent.slug]

    return None


def is_sized_category(category: Category | None) -> bool:
    """A category supports per-size inventory when it has a size family."""
    return get_size_family_for_category(category) is not None