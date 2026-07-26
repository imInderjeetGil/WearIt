from sqlalchemy.orm import Session

from models.category import Category


CATEGORIES = [
    {
        "name": "T-Shirts",
        "slug": "t-shirts",
    },
    {
        "name": "Oversized T-Shirts",
        "slug": "oversized-t-shirts",
    },
    {
        "name": "Shirts",
        "slug": "shirts",
    },
    {
        "name": "Polo T-Shirts",
        "slug": "polo-t-shirts",
    },
    {
        "name": "Jeans",
        "slug": "jeans",
    },
    {
        "name": "Cargo Pants",
        "slug": "cargo-pants",
    },
    {
        "name": "Joggers",
        "slug": "joggers",
    },
    {
        "name": "Shorts",
        "slug": "shorts",
    },
    {
        "name": "Hoodies",
        "slug": "hoodies",
    },
    {
        "name": "Jackets",
        "slug": "jackets",
    },
]


def seed_categories(db: Session):

    if db.query(Category).count() > 0:
        print("✔ Categories already exist")
        return

    categories = [
        Category(**category)
        for category in CATEGORIES
    ]

    db.add_all(categories)
    db.commit()

    print(f"✔ Inserted {len(categories)} Categories")