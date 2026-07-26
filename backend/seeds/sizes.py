from sqlalchemy.orm import Session

from models.size import Size


SIZES = [
    {"name": "XS"},
    {"name": "S"},
    {"name": "M"},
    {"name": "L"},
    {"name": "XL"},
    {"name": "XXL"},
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