"""Development-only product catalog seeder for WearIT.

Creates ~50 realistic products spread across the category hierarchy with
meaningful metadata, per-size inventory (via the existing ProductSize
relationship) and recommendation-friendly occasion/style coverage.

- Resolves categories by SLUG and sizes by NAME from the database (no ids).
- Validates every metadata dict against schemas.ProductMetadataInput so only
  existing taxonomy values can be seeded.
- Idempotent: products are identified by slug; re-running skips what already
  exists instead of duplicating.

Usage:
    python seed_dev_products.py
"""

import re
import sys
from random import Random

from db.session import SessionLocal

# Import every model so SQLAlchemy resolves all relationship() names.
import models.cart  # noqa: F401
import models.order  # noqa: F401
import models.review  # noqa: F401
import models.user  # noqa: F401
import models.user_product_interaction  # noqa: F401
import models.user_profile  # noqa: F401
import models.wishlist  # noqa: F401
from models.category import Category
from models.product import Product
from models.product_metadata import ProductMetadata
from models.product_size import ProductSize
from models.size import Size
from schemas.product_metadata import ProductMetadataInput

BRANDS = [
    "WearIT", "Urban Thread", "Northline", "Avenue",
    "Mono", "District", "Common Ground",
]

# Mirrors frontend/src/shared/utils/catalogConfig.js
SIZE_FAMILIES = {
    "clothing": ["XS", "S", "M", "L", "XL", "XXL"],
    "shirts": ["S", "M", "L", "XL", "XXL"],
    "waist": ["28", "30", "32", "34", "36", "38"],
    "footwear": ["6", "7", "8", "9", "10", "11"],
}

CATEGORY_SIZE_FAMILY = {
    "t-shirts": "clothing", "shirts": "shirts", "hoodies": "clothing",
    "jackets": "clothing", "kurtas": "clothing",
    "jeans": "waist", "trousers": "waist", "shorts": "waist",
    "skirts": "waist", "leggings": "waist",
    "maxi": "clothing", "midi": "clothing", "mini": "clothing",
    "bodycon": "clothing", "wrap": "clothing",
    "sneakers": "footwear", "sandals": "footwear",
    "boots": "footwear", "heels": "footwear",
}

ROOT_ORDER = ["topwear", "bottomwear", "dresses", "footwear", "accessories"]

# ---------------------------------------------------------------------------
# Catalog: (name, subcategory_slug, price, discount_price, gender, fit,
#           color, material, pattern, seasons, occasions, style, description)
# ---------------------------------------------------------------------------
CATALOG = [
    # ----------------------------- TOPWEAR ---------------------------------
    ("Essential Oversized Cotton T-Shirt", "t-shirts", 799, None, "Unisex",
     "Oversized", "Black", "Cotton", "Solid", ["Summer", "Spring"],
     ["Casual", "Streetwear"], "Streetwear",
     "Heavyweight 240 GSM cotton tee with a relaxed oversized drop shoulder."),
    ("Classic Crew Neck Tee", "t-shirts", 599, 479, "Male",
     "Regular", "White", "Cotton", "Solid", ["Summer", "Spring"],
     ["Casual"], "Minimal",
     "A clean everyday crew neck in soft combed cotton."),
    ("Weekend Graphic Print Tee", "t-shirts", 899, None, "Unisex",
     "Regular", "Navy", "Cotton", "Graphic", ["Summer"],
     ["Casual", "Streetwear", "Party"], "Streetwear",
     "Boxy fit tee with an original weekend club graphic print."),
    ("Slim Fit Cotton T-Shirt", "t-shirts", 649, None, "Female",
     "Slim", "Pink", "Cotton", "Solid", ["Summer", "Spring"],
     ["Casual"], "Minimal",
     "Figure-flattering slim cut tee in breathable cotton jersey."),
    ("Ribbed Knit T-Shirt", "t-shirts", 749, None, "Female",
     "Slim", "Beige", "Cotton", "Solid", ["Spring", "Autumn"],
     ["Casual", "Party"], "Minimal",
     "Stretchy ribbed knit tee that layers as well as it stands alone."),
    ("Dry-Fit Training Tee", "t-shirts", 699, None, "Male",
     "Slim", "Grey", "Polyester", "Solid", ["Summer", "Monsoon"],
     ["Sports", "Casual"], "Sport",
     "Moisture-wicking training tee built for high-intensity sessions."),

    ("Relaxed Oxford Shirt", "shirts", 1299, 1049, "Male",
     "Regular", "Blue", "Cotton", "Solid", ["Autumn", "Winter"],
     ["Office", "Casual"], "Formal",
     "Timeless oxford weave shirt with a soft button-down collar."),
    ("Linen Blend Casual Shirt", "shirts", 1499, None, "Male",
     "Relaxed", "White", "Linen", "Solid", ["Summer", "Spring"],
     ["Casual", "Party"], "Casual",
     "Breathable linen blend shirt made for warm evenings out."),
    ("Checked Flannel Shirt", "shirts", 1399, None, "Unisex",
     "Regular", "Maroon", "Cotton", "Checked", ["Winter"],
     ["Casual"], "Vintage",
     "Brushed flannel shirt with a classic winter check."),
    ("Satin Finish Party Shirt", "shirts", 1699, None, "Male",
     "Slim", "Black", "Silk", "Solid", ["Autumn", "Winter"],
     ["Party", "Formal"], "Luxury",
     "Lustrous satin shirt with a tailored slim silhouette."),
    ("Boxy Crop Shirt", "shirts", 1199, None, "Female",
     "Relaxed", "Blue", "Cotton", "Solid", ["Summer", "Spring"],
     ["Casual", "Streetwear"], "Streetwear",
     "Cropped boxy shirt with dropped shoulders and a camp collar."),

    ("Everyday Pullover Hoodie", "hoodies", 1499, 1249, "Unisex",
     "Regular", "Grey", "Cotton", "Solid", ["Autumn", "Winter"],
     ["Casual", "Streetwear"], "Streetwear",
     "Fleece-lined pullover hoodie with kangaroo pockets."),
    ("Zip Through Tech Hoodie", "hoodies", 1799, None, "Male",
     "Regular", "Black", "Polyester", "Plain", ["Winter"],
     ["Sports", "Casual"], "Sport",
     "Lightweight technical zip hoodie for training and travel."),

    ("Minimal Utility Bomber Jacket", "jackets", 2999, 2599, "Unisex",
     "Regular", "Green", "Nylon", "Solid", ["Autumn", "Winter"],
     ["Casual", "Streetwear", "Party"], "Streetwear",
     "Cropped bomber with utility pockets and a matte shell finish."),

    ("Classic Straight Kurta", "kurtas", 1299, None, "Male",
     "Regular", "White", "Cotton", "Solid", ["Summer", "Spring"],
     ["Ethnic", "Casual"], "Casual",
     "Straight-cut cotton kurta with wooden buttons."),
    ("Festive Embroidered Kurta", "kurtas", 1899, 1599, "Male",
     "Regular", "Maroon", "Silk", "Printed", ["Autumn", "Winter"],
     ["Ethnic", "Party"], "Luxury",
     "Festive silk-blend kurta with tonal thread embroidery."),
    ("A-Line Flared Kurta", "kurtas", 1499, None, "Female",
     "Relaxed", "Yellow", "Rayon", "Printed", ["Summer", "Spring"],
     ["Ethnic", "Party", "Casual"], "Casual",
     "Flowy A-line kurta with block-print inspired motifs."),

    # ---------------------------- BOTTOMWEAR -------------------------------
    ("Classic Straight Fit Jeans", "jeans", 1799, None, "Male",
     "Regular", "Blue", "Denim", "Solid", ["All Season"],
     ["Casual"], "Casual",
     "Mid-rise straight leg denim with a clean indigo wash."),
    ("Slim Fit Stretch Jeans", "jeans", 1699, None, "Male",
     "Slim", "Black", "Denim", "Solid", ["All Season"],
     ["Casual", "Party"], "Streetwear",
     "Black skinny-stretch denim that moves with you."),
    ("High Rise Mom Jeans", "jeans", 1899, None, "Female",
     "Relaxed", "Blue", "Denim", "Solid", ["All Season"],
     ["Casual", "Streetwear"], "Vintage",
     "Rigid denim mom jeans with a tapered leg and high waist."),
    ("Distressed Skinny Jeans", "jeans", 1999, 1699, "Female",
     "Slim", "Blue", "Denim", "Plain", ["All Season"],
     ["Party", "Casual"], "Streetwear",
     "Skinny jeans with hand-sanded distressing at the knees."),
    ("Wide Leg Baggy Jeans", "jeans", 2099, None, "Unisex",
     "Relaxed", "Blue", "Denim", "Solid", ["All Season"],
     ["Casual", "Streetwear"], "Streetwear",
     "Loose wide-leg jeans with a low-slung 90s fit."),

    ("Tailored Formal Trousers", "trousers", 1599, None, "Male",
     "Slim", "Navy", "Polyester", "Solid", ["All Season"],
     ["Office", "Formal"], "Formal",
     "Crease-resistant tailored trousers with a half-lined front."),
    ("Pleated Office Trousers", "trousers", 1499, 1249, "Female",
     "Regular", "Black", "Blended", "Solid", ["All Season"],
     ["Office", "Formal"], "Formal",
     "High-rise pleated trousers with a wide straight leg."),
    ("Cotton Chino Trousers", "trousers", 1299, None, "Male",
     "Regular", "Beige", "Cotton", "Solid", ["Spring", "Autumn"],
     ["Casual", "Office"], "Minimal",
     "Softened cotton chinos in a versatile stone shade."),
    ("Elasticated Lounge Trousers", "trousers", 999, None, "Unisex",
     "Relaxed", "Grey", "Cotton", "Plain", ["All Season"],
     ["Casual", "Sports"], "Sport",
     "Tapered jogger-style lounge trousers with cuffed ankles."),

    ("Everyday Cotton Shorts", "shorts", 699, None, "Male",
     "Regular", "Navy", "Cotton", "Solid", ["Summer", "Monsoon"],
     ["Casual", "Sports"], "Sport",
     "Above-knee cotton shorts with an elastic drawstring waist."),

    ("Denim Mini Skirt", "skirts", 1099, None, "Female",
     "Regular", "Blue", "Denim", "Solid", ["Summer", "Spring"],
     ["Casual", "Streetwear", "Party"], "Streetwear",
     "Classic five-pocket denim mini in a rigid rinse wash."),
    ("Pleated Midi Skirt", "skirts", 1299, None, "Female",
     "Regular", "Black", "Polyester", "Solid", ["Spring", "Autumn"],
     ["Casual", "Office"], "Minimal",
     "Knife-pleat midi skirt with a fluid swing."),

    ("High Waist Studio Leggings", "leggings", 899, None, "Female",
     "Slim", "Black", "Nylon", "Solid", ["All Season"],
     ["Sports", "Casual"], "Sport",
     "Squat-proof sculpting leggings with a hidden key pocket."),

    # ------------------------------ DRESSES --------------------------------
    ("Breezy Floral Maxi Dress", "maxi", 2299, None, "Female",
     "Relaxed", "Multi", "Rayon", "Floral", ["Summer", "Spring"],
     ["Casual", "Party"], "Casual",
     "Airy rayon maxi with an all-over floral and side slit."),
    ("Solid Column Maxi Dress", "maxi", 2499, 2099, "Female",
     "Regular", "Green", "Silk", "Solid", ["All Season"],
     ["Party", "Ethnic"], "Luxury",
     "Floor-length silk column dress with a cowl back."),
    ("Ribbed Midi Dress", "midi", 1699, None, "Female",
     "Slim", "Brown", "Cotton", "Solid", ["Autumn", "Winter"],
     ["Casual", "Office"], "Minimal",
     "Body-skimming ribbed knit midi with long sleeves."),
    ("Polka Dot Mini Dress", "mini", 1499, None, "Female",
     "Regular", "White", "Polyester", "Printed", ["Summer", "Spring"],
     ["Party", "Casual"], "Vintage",
     "Playful polka dot mini with puff sleeves."),
    ("Sculpting Bodycon Dress", "bodycon", 1899, None, "Female",
     "Slim", "Black", "Blended", "Solid", ["All Season"],
     ["Party"], "Luxury",
     "Contour-seamed bodycon dress with a square neckline."),
    ("Belted Wrap Dress", "wrap", 1999, 1699, "Female",
     "Regular", "Red", "Rayon", "Solid", ["Spring", "Autumn"],
     ["Party", "Office"], "Formal",
     "True-wrap dress with a self-tie belt and flutter sleeve."),

    # ------------------------------ FOOTWEAR -------------------------------
    ("Platform Street Sneakers", "sneakers", 2799, None, "Unisex",
     "Regular", "White", "Leather", "Solid",
     ["Spring", "Summer", "Autumn"],
     ["Casual", "Streetwear", "Party"], "Streetwear",
     "Chunky platform sole sneaker with a premium leather upper."),
    ("Retro Court Sneakers", "sneakers", 2499, 2099, "Male",
     "Regular", "White", "Leather", "Solid", ["Spring", "Autumn"],
     ["Casual"], "Vintage",
     "Low-profile court classic with gum sole detailing."),
    ("Lightweight Running Sneakers", "sneakers", 3299, None, "Unisex",
     "Regular", "Grey", "Nylon", "Solid", ["All Season"],
     ["Sports", "Casual"], "Sport",
     "Featherweight knit runner with responsive foam cushioning."),
    ("Chunky Dad Sneakers", "sneakers", 2999, None, "Female",
     "Regular", "Beige", "Leather", "Plain",
     ["Spring", "Summer", "Autumn"],
     ["Casual", "Streetwear"], "Streetwear",
     "Layered-sole dad sneaker in tonal neutrals."),

    ("Everyday Slide Sandals", "sandals", 799, None, "Unisex",
     "Regular", "Black", "Polyester", "Solid", ["Summer", "Monsoon"],
     ["Casual"], "Casual",
     "Cushioned slide sandals with a moulded footbed."),
    ("Braided Flat Sandals", "sandals", 999, None, "Female",
     "Regular", "Brown", "Leather", "Solid", ["Summer", "Spring"],
     ["Casual", "Ethnic"], "Casual",
     "Hand-braided leather flats with an ankle strap."),
    ("Traditional Kolhapuri Sandals", "sandals", 1199, None, "Male",
     "Regular", "Brown", "Leather", "Solid", ["Summer", "Spring"],
     ["Ethnic", "Casual"], "Casual",
     "Handcrafted kolhapuri-style sandals with braided toe loop."),

    ("Chelsea Leather Boots", "boots", 3999, 3499, "Male",
     "Regular", "Brown", "Leather", "Solid", ["Autumn", "Winter"],
     ["Party", "Formal", "Casual"], "Formal",
     "Full-grain leather chelsea boots with elastic gores."),

    ("Block Heel Party Pumps", "heels", 2199, None, "Female",
     "Slim", "Black", "Leather", "Solid", ["All Season"],
     ["Party", "Formal"], "Luxury",
     "Walkable block heel pumps with a pointed toe."),

    # ----------------------------- ACCESSORIES -----------------------------
    ("Reversible Leather Belt", "belts", 999, None, "Male",
     "Regular", "Brown", "Leather", "Solid", ["All Season"],
     ["Office", "Casual"], "Minimal",
     "Two-in-one reversible belt with a rotating buckle."),
    ("Logo Baseball Cap", "caps", 599, 479, "Unisex",
     "Regular", "Black", "Cotton", "Solid", ["Summer", "Spring"],
     ["Casual", "Sports", "Streetwear"], "Streetwear",
     "Six-panel cotton cap with embroidered WearIT logo."),
    ("Minimal Analog Watch", "watches", 2499, None, "Unisex",
     "Regular", "Brown", "Leather", "Solid", ["All Season"],
     ["Office", "Party", "Casual"], "Minimal",
     "Slim analog watch with a leather strap and matte dial."),
    ("Canvas Tote Bag", "bags", 799, None, "Unisex",
     "Regular", "Beige", "Cotton", "Plain", ["All Season"],
     ["Casual", "Office"], "Minimal",
     "Heavy-duty canvas tote with an inner zip pocket."),
    ("Layered Bead Necklace", "jewelry", 649, None, "Female",
     "Regular", "Multi", "Blended", "Solid", ["All Season"],
     ["Party", "Ethnic", "Casual"], "Casual",
     "Three-strand beaded necklace with antique finish."),
]


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def main() -> None:
    db = SessionLocal()

    try:
        categories = {c.slug: c for c in db.query(Category).all()}
        sizes_by_name = {s.name: s for s in db.query(Size).all()}

        required_slugs = sorted({entry[1] for entry in CATALOG})
        missing_categories = [s for s in required_slugs if s not in categories]
        if missing_categories:
            print(f"ERROR: missing categories in DB: {missing_categories}")
            sys.exit(1)

        required_sizes = sorted(
            {name for entry in CATALOG
             for name in SIZE_FAMILIES.get(CATEGORY_SIZE_FAMILY.get(entry[1]), [])}
        )
        missing_sizes = [s for s in required_sizes if s not in sizes_by_name]
        if missing_sizes:
            print(f"ERROR: missing sizes in DB: {missing_sizes} "
                  "(run seeds.sizes.seed_sizes first)")
            sys.exit(1)

        existing_slugs = {
            slug for (slug,) in db.query(Product.slug).all()
        }

        rng = Random(42)  # deterministic stock numbers
        brands = iter(BRANDS * 10)

        created = skipped = size_rows = 0
        root_counts: dict[str, int] = {}
        gender_counts: dict[str, int] = {}

        for entry in CATALOG:
            (name, sub_slug, price, discount_price, gender, fit, color,
             material, pattern, seasons, occasions, style, description) = entry

            slug = slugify(name)
            if slug in existing_slugs:
                skipped += 1
                continue

            # Validate metadata against the real schema (raises on bad values).
            metadata = ProductMetadataInput(
                fit_type=fit,
                gender_target=gender,
                color=color,
                material=material,
                pattern=pattern,
                season=seasons,
                occasion=occasions,
                style=style,
            ).model_dump()

            category = categories[sub_slug]
            family = CATEGORY_SIZE_FAMILY.get(sub_slug)

            # Deterministic per-size stock; always keep some sizes in stock.
            # Accessories have no size system and get no ProductSize rows.
            stock_map = {
                size_name: rng.randint(0, 20)
                for size_name in SIZE_FAMILIES.get(family, [])
            }
            if stock_map and all(stock == 0 for stock in stock_map.values()):
                first_two = list(stock_map)[:2]
                for size_name in first_two:
                    stock_map[size_name] = rng.randint(8, 20)

            product = Product(
                name=name,
                slug=slug,
                description=description,
                price=float(price),
                discount_price=float(discount_price) if discount_price else None,
                quantity=sum(stock_map.values()),
                brand=next(brands),
                image_url="",
                category_id=category.id,
            )
            db.add(product)
            db.flush()

            db.add(ProductMetadata(product_id=product.id, **metadata))

            for size_name, stock in stock_map.items():
                db.add(ProductSize(
                    product_id=product.id,
                    size_id=sizes_by_name[size_name].id,
                    stock=stock,
                ))
                size_rows += 1

            # Root category for the summary (one-level hierarchy).
            node = category
            while node.parent_id is not None:
                node = next(c for c in categories.values() if c.id == node.parent_id)
            root_counts[node.slug] = root_counts.get(node.slug, 0) + 1
            gender_counts[gender] = gender_counts.get(gender, 0) + 1

            created += 1
            existing_slugs.add(slug)

        db.commit()

        print("=" * 60)
        print("WearIT development catalog seeding complete")
        print("=" * 60)
        print(f"Products created      : {created}")
        print(f"Products skipped      : {skipped} (already present)")
        print(f"Product sizes created : {size_rows}")
        print("-" * 60)
        print("Category summary:")
        for root in ROOT_ORDER:
            print(f"  {root.capitalize():<12}: {root_counts.get(root, 0)}")
        print("-" * 60)
        print("Gender summary:")
        for gender in ("Male", "Female", "Unisex"):
            print(f"  {gender:<12}: {gender_counts.get(gender, 0)}")
        print("=" * 60)

    except Exception as exc:
        db.rollback()
        print(f"ERROR: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()