import requests

BASE_URL = "http://127.0.0.1:8000"

# Put your LOCAL admin JWT here.
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3ODczNzMyNzB9.2WJZunpJZl3bvN8BwD0i8pRMeb5kJyNtB3NVOqjsGD4"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
}


CATEGORY_TREE = {
    "Topwear": [
        "T-Shirts",
        "Shirts",
        "Hoodies",
        "Jackets",
        "Kurtas",
    ],
    "Bottomwear": [
        "Jeans",
        "Trousers",
        "Shorts",
        "Skirts",
        "Leggings",
    ],
    "Dresses": [
        "Maxi",
        "Midi",
        "Mini",
        "Bodycon",
        "A-Line",
        "Shift",
        "Wrap",
    ],
    "Footwear": [
        "Sneakers",
        "Sandals",
        "Boots",
        "Heels",
    ],
    "Accessories": [
        "Belts",
        "Caps",
        "Watches",
        "Bags",
        "Jewelry",
    ],
}


def slugify(name):
    return (
        name.lower()
        .replace("&", "and")
        .replace(" ", "-")
    )


def create_category(name, parent_id=None):
    payload = {
        "name": name,
        "slug": slugify(name),
        "parent_id": parent_id,
    }

    response = requests.post(
        f"{BASE_URL}/categories",
        headers=HEADERS,
        json=payload,
        timeout=15,
    )

    if response.status_code not in (200, 201):
        print(
            f"[ERROR] {name} -> "
            f"HTTP {response.status_code}: {response.text}"
        )
        raise SystemExit(1)

    data = response.json()

    print(
        f"[+] {name}"
        f" (id={data['id']}, parent_id={data.get('parent_id')})"
    )

    return data


def main():
    print("=" * 60)
    print("WearIT Category Hierarchy Seeder")
    print("=" * 60)

    print("\nChecking existing categories...")

    response = requests.get(
        f"{BASE_URL}/categories",
        timeout=15,
    )

    if response.status_code != 200:
        print(response.status_code, response.text)
        raise SystemExit(1)

    existing = response.json()

    if existing:
        print(
            f"WARNING: {len(existing)} categories already exist."
        )
        print("This script is intended for the fresh local DB.")
        raise SystemExit(1)

    print("Database is empty. Starting seed...\n")

    total = 0

    for parent_name, children in CATEGORY_TREE.items():

        parent = create_category(parent_name)
        parent_id = parent["id"]

        total += 1

        for child_name in children:
            create_category(
                child_name,
                parent_id=parent_id,
            )
            total += 1

    print("\n" + "=" * 60)
    print("Category seeding complete")
    print(f"Total categories created: {total}")
    print("=" * 60)

    print("\nFinal hierarchy:\n")

    response = requests.get(
        f"{BASE_URL}/categories",
        timeout=15,
    )

    categories = response.json()

    by_id = {
        category["id"]: category
        for category in categories
    }

    for category in categories:
        if category["parent_id"] is None:
            print(f"\n{category['name']}")

            for child in categories:
                if child["parent_id"] == category["id"]:
                    print(f"  └── {child['name']}")


if __name__ == "__main__":
    main()