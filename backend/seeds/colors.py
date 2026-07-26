from sqlalchemy.orm import Session

from models.color import Color


COLORS = [
    {
        "name": "Black",
        "hex_code": "#000000",
    },
    {
        "name": "White",
        "hex_code": "#FFFFFF",
    },
    {
        "name": "Grey",
        "hex_code": "#808080",
    },
    {
        "name": "Navy",
        "hex_code": "#001F54",
    },
    {
        "name": "Blue",
        "hex_code": "#2563EB",
    },
    {
        "name": "Olive",
        "hex_code": "#556B2F",
    },
    {
        "name": "Brown",
        "hex_code": "#8B4513",
    },
    {
        "name": "Cream",
        "hex_code": "#FFFDD0",
    },
    {
        "name": "Beige",
        "hex_code": "#F5F5DC",
    },
    {
        "name": "Maroon",
        "hex_code": "#800000",
    },
]


def seed_colors(db: Session):

    if db.query(Color).count() > 0:
        print("✔ Colors already exist")
        return

    colors = [
        Color(**color)
        for color in COLORS
    ]

    db.add_all(colors)
    db.commit()

    print(f"✔ Inserted {len(colors)} Colors")