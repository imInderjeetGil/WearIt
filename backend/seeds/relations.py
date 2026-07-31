import random

from sqlalchemy.orm import Session
from models.product import Product
from models.size import Size
from models.product_size import ProductSize



TOPWEAR = [
    "T-Shirts",
    "Oversized T-Shirts",
    "Shirts",
    "Polo T-Shirts",
    "Hoodies",
    "Jackets",
]

BOTTOMWEAR = [
    "Jeans",
    "Cargo Pants",
    "Joggers",
    "Shorts",
]


def seed_product_relations(db: Session):

    if db.query(ProductSize).count() > 0:
        print("✔ Product relations already exist")
        return

    products = db.query(Product).all()

    sizes = db.query(Size).all()

    size_map = {
        size.name: size.id
        for size in sizes
    }

    for product in products:

        category = product.category.name

        # ---------- Sizes ----------

        if category in TOPWEAR:

            available = random.sample(
                [
                    "S",
                    "M",
                    "L",
                    "XL",
                    "XXL",
                ],
                random.randint(3, 5),
            )

        else:

            available = random.sample(
                [
                    "S",
                    "M",
                    "L",
                    "XL",
                ],
                random.randint(2, 4),
            )

        for size in available:

            db.add(
                ProductSize(
                    product_id=product.id,
                    size_id=size_map[size],
                    stock=random.randint(5, 25),
                )
            )

    db.commit()

    print("✔ Product relations inserted")