from sqlalchemy.orm import Session

from models.size import Size


# Size families used across the catalog:
# - clothing: tops/dresses (XS-XXL)
# - shirts:   shirts (S-XXL, no XS)
# - waist:    bottomwear (28-38)
# - footwear: shoes (6-11)
SIZES = [
    {"name": "XS"},
    {"name": "S"},
    {"name": "M"},
    {"name": "L"},
    {"name": "XL"},
    {"name": "XXL"},
    {"name": "28"},
    {"name": "30"},
    {"name": "32"},
    {"name": "34"},
    {"name": "36"},
    {"name": "38"},
    {"name": "6"},
    {"name": "7"},
    {"name": "8"},
    {"name": "9"},
    {"name": "10"},
    {"name": "11"},
]

def seed_sizes(db: Session):

    if db.query(Size).count() > 0:
        print("✔ Sizes already exist")
        return

    sizes = [
        Size(**size)
        for size in SIZES
    ]

    db.add_all(sizes)
    db.commit()

    print(f"✔ Inserted {len(sizes)} Sizes")