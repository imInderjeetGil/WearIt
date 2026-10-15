
from sqlalchemy.orm import Session

from models.size import Size


# Master size list: union of sizes used by supported category families.
# Category-specific assignment is handled by the product seeder.
SIZES = [
    # Clothing
    "XS", "S", "M", "L", "XL", "XXL",

    # Waist sizes: jeans, trousers, shorts, skirts, leggings
    "28", "30", "32", "34", "36", "38",

    # Footwear
    "6", "7", "8", "9", "10", "11",
]


def seed_sizes(db: Session) -> None:
    existing_names = {
        name for (name,) in db.query(Size.name).all()
    }

    new_sizes = [
        Size(name=name)
        for name in SIZES
        if name not in existing_names
    ]

    if not new_sizes:
        print("✔ All sizes already exist")
        return

    db.add_all(new_sizes)
    db.commit()

    print(f"✔ Inserted {len(new_sizes)} sizes")
    print(f"✔ Total supported sizes: {len(existing_names) + len(new_sizes)}")
