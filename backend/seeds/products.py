import random
from sqlalchemy.orm import Session

from models.product import Product
from models.category import Category


BRANDS = [
    "WearIt",
    "Nike",
    "Adidas",
    "Puma",
    "Levi's",
    "H&M",
]


PRODUCTS = {
    "T-Shirts": [
        "Classic Crew Neck Tee",
        "Premium Cotton Tee",
        "Essential Everyday Tee",
        "Graphic Print Tee",
        "Minimal Logo Tee",
    ],

    "Oversized T-Shirts": [
        "Urban Oversized Tee",
        "Heavyweight Oversized Tee",
        "Vintage Washed Tee",
        "Streetwear Oversized Tee",
        "Drop Shoulder Tee",
    ],

    # ... baaki saari categories
}


def seed_products(db: Session):

    if db.query(Product).count() > 0:
        print("✔ Products already exist")
        return
    products = [
        Product(
    name="Premium Cotton Tee",
    slug="premium-cotton-tee",
    description="Made from 240 GSM premium combed cotton. Soft, breathable, and designed for all-day comfort.",
    price=999,
    discount_price=799,
    quantity=50,
    brand="Nike",
    image_url="/products/premium-cotton-tee.jpg",
    category_id=1,
),

Product(
    name="Classic Crew Neck Tee",
    slug="classic-crew-neck-tee",
    description="A timeless crew neck t-shirt crafted with premium cotton and a regular fit for everyday wear.",
    price=899,
    discount_price=None,
    quantity=45,
    brand="WearIt",
    image_url="/products/classic-crew-neck-tee.jpg",
    category_id=1,
),

Product(
    name="Minimal Logo Tee",
    slug="minimal-logo-tee",
    description="Minimal branding with premium fabric and modern tailoring for a clean everyday look.",
    price=1099,
    discount_price=899,
    quantity=38,
    brand="Adidas",
    image_url="/products/minimal-logo-tee.jpg",
    category_id=1,
),

Product(
    name="Graphic Print Tee",
    slug="graphic-print-tee",
    description="Bold front graphic printed on heavyweight cotton with long-lasting color retention.",
    price=1199,
    discount_price=999,
    quantity=30,
    brand="Puma",
    image_url="/products/graphic-print-tee.jpg",
    category_id=1,
),

Product(
    name="Vintage Wash Tee",
    slug="vintage-wash-tee",
    description="Acid washed premium cotton t-shirt inspired by vintage streetwear fashion.",
    price=1299,
    discount_price=1099,
    quantity=25,
    brand="Zara",
    image_url="/products/vintage-wash-tee.jpg",
    category_id=1,
),Product(
    name="Urban Oversized Tee",
    slug="urban-oversized-tee",
    description="Relaxed oversized fit with drop shoulders and heavyweight 260 GSM cotton for a premium streetwear look.",
    price=1499,
    discount_price=1199,
    quantity=35,
    brand="WearIt",
    image_url="/products/urban-oversized-tee.jpg",
    category_id=2,
),

Product(
    name="Heavyweight Oversized Tee",
    slug="heavyweight-oversized-tee",
    description="Premium heavyweight oversized t-shirt made for everyday comfort and durability.",
    price=1599,
    discount_price=1299,
    quantity=28,
    brand="Nike",
    image_url="/products/heavyweight-oversized-tee.jpg",
    category_id=2,
),

Product(
    name="Drop Shoulder Tee",
    slug="drop-shoulder-tee",
    description="Modern drop shoulder silhouette with premium cotton construction and relaxed styling.",
    price=1399,
    discount_price=1099,
    quantity=40,
    brand="Adidas",
    image_url="/products/drop-shoulder-tee.jpg",
    category_id=2,
),

Product(
    name="Vintage Oversized Tee",
    slug="vintage-oversized-tee",
    description="Garment dyed oversized t-shirt with a vintage washed finish for a timeless streetwear aesthetic.",
    price=1699,
    discount_price=1399,
    quantity=22,
    brand="Zara",
    image_url="/products/vintage-oversized-tee.jpg",
    category_id=2,
),

Product(
    name="Box Fit Tee",
    slug="box-fit-tee",
    description="Premium box fit t-shirt featuring a structured silhouette and ultra-soft cotton fabric.",
    price=1549,
    discount_price=None,
    quantity=30,
    brand="Uniqlo",
    image_url="/products/box-fit-tee.jpg",
    category_id=2,
),Product(
    name="Oxford Cotton Shirt",
    slug="oxford-cotton-shirt",
    description="Premium Oxford weave shirt crafted from breathable cotton with a modern slim fit.",
    price=1899,
    discount_price=1599,
    quantity=32,
    brand="Levi's",
    image_url="/products/oxford-cotton-shirt.jpg",
    category_id=3,
),

Product(
    name="Linen Casual Shirt",
    slug="linen-casual-shirt",
    description="Lightweight linen shirt designed for maximum comfort during warm weather.",
    price=2199,
    discount_price=1899,
    quantity=24,
    brand="Zara",
    image_url="/products/linen-casual-shirt.jpg",
    category_id=3,
),

Product(
    name="Checked Flannel Shirt",
    slug="checked-flannel-shirt",
    description="Soft brushed flannel shirt featuring a timeless checked pattern.",
    price=1999,
    discount_price=1699,
    quantity=28,
    brand="H&M",
    image_url="/products/checked-flannel-shirt.jpg",
    category_id=3,
),

Product(
    name="Mandarin Collar Shirt",
    slug="mandarin-collar-shirt",
    description="Contemporary mandarin collar shirt with premium cotton construction.",
    price=1799,
    discount_price=None,
    quantity=36,
    brand="WearIt",
    image_url="/products/mandarin-collar-shirt.jpg",
    category_id=3,
),

Product(
    name="Classic Polo",
    slug="classic-polo",
    description="Classic pique cotton polo with ribbed collar and premium finishing.",
    price=1599,
    discount_price=1299,
    quantity=42,
    brand="Nike",
    image_url="/products/classic-polo.jpg",
    category_id=4,
),
    ]
    db.add_all(products)
    db.commit()

    print(f"✔ Inserted {len(products)} Products")