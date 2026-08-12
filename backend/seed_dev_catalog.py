"""WEARIT — DEVELOPMENT CATALOG RESET + REALISTIC SEED DATA.

DEVELOPMENT ONLY. Never run against production.

What it does
------------
1. Resets dev catalog data (FK-aware): order_items, orders, reviews, cart_items,
   wishlist, user_product_interactions, product_sizes, product_metadata,
   products, categories — and removes disposable dev test users
   (__gemini_smoke__* / verify_*@test.com). Preserves real users, admin, sizes.
2. Re-seeds 9 flat categories and 14 realistic products (7 men + 7 women), each
   with complete ProductMetadata (only schema enum values), deterministic
   sizes/stocks, and an S3-hosted product image.
3. Images are downloaded from a verified public source and uploaded through the
   existing S3 pipeline (services.s3_service.upload_image). Download/upload
   happens BEFORE any table is wiped, so a network failure cannot leave the
   dev DB half-deleted. Any failure here aborts before touching data.
4. Prints a summary.

Repeatable: safe to re-run. Re-runs upload fresh images (orphaned S3 objects
are acceptable in dev).
"""

import io
import sys

import requests
from PIL import Image

# Register every model so SQLAlchemy can resolve all string relationship targets
# (e.g. Product.reviews -> Review) before the first query triggers mapper config.
from models import (  # noqa: F401
    cart,
    category,
    order,
    product,
    product_metadata,
    product_size,
    review,
    size,
    user,
    user_product_interaction,
    user_profile,
    wishlist,
)

from db.session import SessionLocal
from services import s3_service

# ---------------------------------------------------------------------------
# Flat categories (the Category model is flat — no hierarchy)
# ---------------------------------------------------------------------------
CATEGORIES = [
    {"name": "Men - Shirts", "slug": "men-shirts"},
    {"name": "Men - T-Shirts", "slug": "men-t-shirts"},
    {"name": "Men - Trousers", "slug": "men-trousers"},
    {"name": "Men - Jeans", "slug": "men-jeans"},
    {"name": "Men - Kurtas", "slug": "men-kurtas"},
    {"name": "Women - Dresses", "slug": "women-dresses"},
    {"name": "Women - Tops", "slug": "women-tops"},
    {"name": "Women - Trousers", "slug": "women-trousers"},
    {"name": "Women - Kurtas", "slug": "women-kurtas"},
]

# ---------------------------------------------------------------------------
# 14 products. metadata uses ONLY values allowed by schemas/product_metadata.py.
# occasion uses the enum ("Ethnic" for festive) — the engine maps diwali /
# festival / wedding / ethnic to it. discount_price is selective (not every
# product). quantity is the sum of per-size stock.
# ---------------------------------------------------------------------------
PRODUCTS = [
    {
        "name": "Ivory Cotton Kurta",
        "slug": "ivory-cotton-kurta",
        "description": "Handwoven-feel ivory cotton kurta with a mandarin collar and clean tailoring — an elegant festive essential that pairs beautifully with beige trousers.",
        "price": 1499, "discount_price": 1299, "brand": "WearIt",
        "category": "Men - Kurtas",
        "metadata": {"occasion": "Ethnic", "style": "Formal", "fit_type": "Regular", "gender_target": "Male", "color": "White", "material": "Cotton", "pattern": "Solid", "season": "All Season"},
        "sizes": {"M": 5, "L": 5, "XL": 4, "XXL": 2},
        "image_url": "https://images.pexels.com/photos/8489652/pexels-photo-8489652.jpeg",
    },
    {
        "name": "Black Oversized Shirt",
        "slug": "black-oversized-shirt",
        "description": "Relaxed oversized cotton shirt with drop shoulders and a boxy silhouette — the anchor of a laid-back streetwear fit.",
        "price": 1399, "discount_price": None, "brand": "WearIt",
        "category": "Men - Shirts",
        "metadata": {"occasion": "Casual", "style": "Streetwear", "fit_type": "Oversized", "gender_target": "Male", "color": "Black", "material": "Cotton", "pattern": "Solid", "season": "All Season"},
        "sizes": {"S": 4, "M": 6, "L": 5, "XL": 5},
        "image_url": "https://images.pexels.com/photos/9985771/pexels-photo-9985771.jpeg",
    },
    {
        "name": "White Oxford Shirt",
        "slug": "white-oxford-shirt",
        "description": "Crisp Oxford-weave cotton shirt in a slim fit — a smart-casual workhorse that goes from office to evening.",
        "price": 1599, "discount_price": 1299, "brand": "WearIt",
        "category": "Men - Shirts",
        "metadata": {"occasion": "Office", "style": "Formal", "fit_type": "Slim", "gender_target": "Male", "color": "White", "material": "Cotton", "pattern": "Solid", "season": "All Season"},
        "sizes": {"S": 4, "M": 5, "L": 5, "XL": 6, "XXL": 4},
        "image_url": "https://images.pexels.com/photos/10106995/pexels-photo-10106995.jpeg",
    },
    {
        "name": "Beige Chino Trousers",
        "slug": "beige-chino-trousers",
        "description": "Tailored beige chinos with a regular fit and a clean taper — versatile with everything from kurtas to oxford shirts.",
        "price": 1199, "discount_price": None, "brand": "WearIt",
        "category": "Men - Trousers",
        "metadata": {"occasion": "Formal", "style": "Formal", "fit_type": "Regular", "gender_target": "Male", "color": "Beige", "material": "Cotton", "pattern": "Solid", "season": "All Season"},
        "sizes": {"S": 6, "M": 8, "L": 8, "XL": 6},
        "image_url": "https://images.pexels.com/photos/9464625/pexels-photo-9464625.jpeg",
    },
    {
        "name": "Navy Slim Jeans",
        "slug": "navy-slim-jeans",
        "description": "Stretch-denim navy jeans with a slim, clean-cut leg — an easy dark wash for date nights and weekends.",
        "price": 1499, "discount_price": 1299, "brand": "WearIt",
        "category": "Men - Jeans",
        "metadata": {"occasion": "Casual", "style": "Casual", "fit_type": "Slim", "gender_target": "Male", "color": "Navy", "material": "Denim", "pattern": "Solid", "season": "All Season"},
        "sizes": {"S": 5, "M": 6, "L": 6, "XL": 5},
        "image_url": "https://images.pexels.com/photos/10133278/pexels-photo-10133278.jpeg",
    },
    {
        "name": "Olive Cargo Pants",
        "slug": "olive-cargo-pants",
        "description": "Olive cargo pants with utility pockets and a regular fit — rugged comfort built for streetwear and travel.",
        "price": 1299, "discount_price": None, "brand": "WearIt",
        "category": "Men - Trousers",
        "metadata": {"occasion": "Casual", "style": "Streetwear", "fit_type": "Regular", "gender_target": "Male", "color": "Green", "material": "Cotton", "pattern": "Solid", "season": "All Season"},
        "sizes": {"S": 4, "M": 5, "L": 5, "XL": 4},
        "image_url": "https://images.pexels.com/photos/11716436/pexels-photo-11716436.jpeg",
    },
    {
        "name": "Black Minimal Tee",
        "slug": "black-minimal-tee",
        "description": "A clean black crew-neck tee in soft combed cotton — the quiet staple that goes with everything.",
        "price": 699, "discount_price": 599, "brand": "WearIt",
        "category": "Men - T-Shirts",
        "metadata": {"occasion": "Casual", "style": "Minimal", "fit_type": "Regular", "gender_target": "Male", "color": "Black", "material": "Cotton", "pattern": "Solid", "season": "Summer"},
        "sizes": {"S": 8, "M": 10, "L": 10, "XL": 8, "XXL": 4},
        "image_url": "https://images.pexels.com/photos/8791990/pexels-photo-8791990.jpeg",
    },
    {
        "name": "Maroon Festive Kurta",
        "slug": "maroon-festive-kurta",
        "description": "A rich maroon kurta in breathable cotton with delicate detailing — festive-ready paired with cream trousers.",
        "price": 1599, "discount_price": 1399, "brand": "WearIt",
        "category": "Women - Kurtas",
        "metadata": {"occasion": "Ethnic", "style": "Formal", "fit_type": "Regular", "gender_target": "Female", "color": "Maroon", "material": "Cotton", "pattern": "Solid", "season": "All Season"},
        "sizes": {"XS": 3, "S": 4, "M": 4, "L": 3, "XL": 2},
        "image_url": "https://images.pexels.com/photos/18700114/pexels-photo-18700114.jpeg",
    },
    {
        "name": "Cream Straight Trousers",
        "slug": "cream-straight-trousers",
        "description": "High-rise cream straight-leg trousers with a fluid drape — an easy festive pairing with kurtas and tops alike.",
        "price": 1299, "discount_price": None, "brand": "WearIt",
        "category": "Women - Trousers",
        "metadata": {"occasion": "Ethnic", "style": "Formal", "fit_type": "Regular", "gender_target": "Female", "color": "Beige", "material": "Cotton", "pattern": "Solid", "season": "All Season"},
        "sizes": {"XS": 4, "S": 4, "M": 5, "L": 4, "XL": 3},
        "image_url": "https://images.pexels.com/photos/17135748/pexels-photo-17135748.jpeg",
    },
    {
        "name": "Black Ribbed Top",
        "slug": "black-ribbed-top",
        "description": "A fitted black ribbed top with a flattering scoop neck — a layering essential for casual and date fits.",
        "price": 899, "discount_price": 749, "brand": "WearIt",
        "category": "Women - Tops",
        "metadata": {"occasion": "Casual", "style": "Minimal", "fit_type": "Slim", "gender_target": "Female", "color": "Black", "material": "Cotton", "pattern": "Solid", "season": "All Season"},
        "sizes": {"XS": 5, "S": 6, "M": 6, "L": 5},
        "image_url": "https://images.pexels.com/photos/13253186/pexels-photo-13253186.jpeg",
    },
    {
        "name": "Black Party Dress",
        "slug": "black-party-dress",
        "description": "A sleek little black dress in a body-skimming fit — understated glamour for parties and evenings out.",
        "price": 2499, "discount_price": 1999, "brand": "WearIt",
        "category": "Women - Dresses",
        "metadata": {"occasion": "Party", "style": "Luxury", "fit_type": "Slim", "gender_target": "Female", "color": "Black", "material": "Polyester", "pattern": "Solid", "season": "All Season"},
        "sizes": {"XS": 3, "S": 3, "M": 3, "L": 1},
        "image_url": "https://images.pexels.com/photos/13569179/pexels-photo-13569179.jpeg",
    },
    {
        "name": "Floral Midi Dress",
        "slug": "floral-midi-dress",
        "description": "A breezy floral midi with a relaxed drape and flutter sleeves — spring-date energy in one piece.",
        "price": 1899, "discount_price": 1599, "brand": "WearIt",
        "category": "Women - Dresses",
        "metadata": {"occasion": "Casual", "style": "Casual", "fit_type": "Regular", "gender_target": "Female", "color": "Multi", "material": "Rayon", "pattern": "Floral", "season": "Spring"},
        "sizes": {"XS": 4, "S": 4, "M": 4, "L": 3},
        "image_url": "https://images.pexels.com/photos/7509903/pexels-photo-7509903.jpeg",
    },
    {
        "name": "Beige Button-Up Shirt",
        "slug": "beige-button-up-shirt",
        "description": "A crisp beige button-up with a tailored slim cut — polish for the office, ease for everything else.",
        "price": 1299, "discount_price": None, "brand": "WearIt",
        "category": "Women - Tops",
        "metadata": {"occasion": "Office", "style": "Formal", "fit_type": "Slim", "gender_target": "Female", "color": "Beige", "material": "Cotton", "pattern": "Solid", "season": "All Season"},
        "sizes": {"XS": 4, "S": 4, "M": 5, "L": 4, "XL": 2},
        "image_url": "https://images.pexels.com/photos/7760799/pexels-photo-7760799.jpeg",
    },
    {
        "name": "Blue Straight Jeans",
        "slug": "blue-straight-jeans",
        "description": "Mid-rise straight-leg jeans in a true blue wash — a dependable pair that shapes casual and date looks.",
        "price": 1299, "discount_price": 1099, "brand": "WearIt",
        "category": "Women - Trousers",
        "metadata": {"occasion": "Casual", "style": "Casual", "fit_type": "Regular", "gender_target": "Female", "color": "Blue", "material": "Denim", "pattern": "Solid", "season": "All Season"},
        "sizes": {"XS": 5, "S": 6, "M": 6, "L": 4},
        "image_url": "https://images.pexels.com/photos/1082526/pexels-photo-1082526.jpeg",
    },
]


def _fetch_and_upload(slug: str, source_url: str) -> str:
    """Download the source image and push it through the S3 pipeline. Fail loudly."""
    resp = requests.get(source_url, timeout=60, headers={"User-Agent": "Mozilla/5.0 (WearIt dev seed)"})
    if resp.status_code != 200:
        raise RuntimeError(f"[{slug}] image download failed: HTTP {resp.status_code}")
    if not (resp.headers.get("content-type") or "").startswith("image/"):
        raise RuntimeError(f"[{slug}] not an image: {resp.headers.get('content-type')}")
    try:
        Image.open(io.BytesIO(resp.content)).verify()
    except Exception as exc:
        raise RuntimeError(f"[{slug}] downloaded bytes are not a valid image: {exc}")
    url = s3_service.upload_image(resp.content, f"{slug}.jpg", "image/jpeg", folder="products")
    print(f"  uploaded {slug} -> {url}")
    return url


def _reset(db) -> None:
    from sqlalchemy import text

    # Children first (FK NO ACTION), then parents. CASCADE tables deleted explicitly
    # for clarity. Sizes/users are preserved.
    tables = [
        "order_items", "orders", "reviews", "cart_items", "wishlist",
        "user_product_interactions", "product_sizes", "product_metadata",
        "products", "categories",
    ]
    for table in tables:
        db.execute(text(f'DELETE FROM "{table}"'))
    db.commit()

    # Remove disposable dev test users (profiles + interactions cascade).
    removed = db.execute(
        text("DELETE FROM users WHERE email LIKE '__gemini_smoke__%' OR email LIKE 'verify_%@test.com' RETURNING id, email")
    ).fetchall()
    db.commit()

    # Reset identity sequences so the fresh catalog reads ids 1..N (cosmetic).
    for table in ["categories", "products", "product_metadata", "orders", "order_items", "reviews", "wishlist", "user_product_interactions"]:
        db.execute(
            text(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM {table}")
        )
    db.commit()

    print(f"  reset: cleared {len(tables)} tables; removed {len(removed)} disposable test users: {[r[1] for r in removed]}")


def main() -> None:
    from models.category import Category
    from models.product import Product
    from models.product_metadata import ProductMetadata
    from models.product_size import ProductSize
    from models.size import Size

    # --- STEP 1: fetch + upload images BEFORE touching any data ---
    print("STEP 1/3 — uploading product images to S3 ...")
    image_urls: dict[str, str] = {}
    for p in PRODUCTS:
        image_urls[p["slug"]] = _fetch_and_upload(p["slug"], p["image_url"])

    db = SessionLocal()
    try:
        # --- STEP 2: reset dev catalog data ---
        print("STEP 2/3 — resetting dev catalog data ...")
        _reset(db)

        # --- STEP 3: seed ---
        print("STEP 3/3 — seeding categories, products, metadata, sizes ...")

        size_map = {s.name: s.id for s in db.query(Size).all()}

        for cat in CATEGORIES:
            db.add(Category(name=cat["name"], slug=cat["slug"]))
        db.flush()
        cat_map = {c.name: c.id for c in db.query(Category).all()}

        for spec in PRODUCTS:
            quantity = sum(spec["sizes"].values())
            product = Product(
                name=spec["name"],
                slug=spec["slug"],
                description=spec["description"],
                price=spec["price"],
                discount_price=spec["discount_price"],
                quantity=quantity,
                brand=spec["brand"],
                image_url=image_urls[spec["slug"]],
                category_id=cat_map[spec["category"]],
            )
            db.add(product)
            db.flush()  # assign product.id

            db.add(ProductMetadata(product_id=product.id, **spec["metadata"]))

            for size_name, stock in spec["sizes"].items():
                db.add(ProductSize(product_id=product.id, size_id=size_map[size_name], stock=stock))

        db.commit()

        # --- summary ---
        categories = db.query(Category).count()
        products = db.query(Product).count()
        metadata = db.query(ProductMetadata).count()
        size_rows = db.query(ProductSize).count()
        out_of_stock = db.query(Product).filter(Product.quantity <= 0).count()

        from sqlalchemy import text
        orders = db.execute(text("SELECT count(*) FROM orders")).scalar()
        reviews = db.execute(text("SELECT count(*) FROM reviews")).scalar()
        interactions = db.execute(text("SELECT count(*) FROM user_product_interactions")).scalar()
        wishlist = db.execute(text("SELECT count(*) FROM wishlist")).scalar()
        cart = db.execute(text("SELECT count(*) FROM cart_items")).scalar()

        print("\n=== WEARIT DEV CATALOG — SUMMARY ===")
        print(f"categories      : {categories}")
        print(f"products        : {products}")
        print(f"metadata        : {metadata}/{products}")
        print(f"size rows       : {size_rows}")
        print(f"out-of-stock    : {out_of_stock}")
        print(f"orders          : {orders}")
        print(f"reviews         : {reviews}")
        print(f"interactions    : {interactions}")
        print(f"wishlist        : {wishlist}")
        print(f"cart_items      : {cart}")
        print("\n--- products ---")
        for spec in PRODUCTS:
            disc = f"-> {spec['discount_price']}" if spec["discount_price"] else ""
            md = spec["metadata"]
            print(f"  {spec['slug']:26s} Rs.{spec['price']}{disc:>9s}  {spec['category']:18s} {md['occasion']:10s} {md['style']:11s} qty={sum(spec['sizes'].values()):>2d}")
        print("\nSEED COMPLETE — dev catalog ready.")
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
