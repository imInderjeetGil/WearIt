import requests
import sys

# ============================================================
# WearIT - Bulk Category Seeder
# ============================================================

BASE_URL = "http://localhost:8000"  # Change this to your API base URL if different
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3ODcwMjUxNjJ9.C5Q9GLwyrSizUPxj8Qx-t-0XZIkQYnFPFUNozkWrr4Q"

CATEGORIES = [
    ("T-Shirts", "t-shirts"),
    ("Shirts", "shirts"),
    ("Tops", "tops"),
    ("Dresses", "dresses"),
    ("Jeans", "jeans"),
    ("Pants", "pants"),
    ("Trousers", "trousers"),
    ("Shorts", "shorts"),
    ("Skirts", "skirts"),
    ("Hoodies", "hoodies"),
    ("Sweatshirts", "sweatshirts"),
    ("Jackets", "jackets"),
    ("Coats", "coats"),
    ("Activewear", "activewear"),
    ("Ethnic Wear", "ethnic-wear"),
]


# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
}


# ------------------------------------------------------------
# Get existing categories
# ------------------------------------------------------------

def get_existing_categories():
    print("\nFetching existing categories...")

    response = requests.get(
        f"{BASE_URL}/categories",
        headers=HEADERS,
        timeout=15,
    )

    if response.status_code != 200:
        print(f"ERROR: Could not fetch categories.")
        print(f"Status: {response.status_code}")
        print(response.text)
        sys.exit(1)

    data = response.json()

    # Adjust this if your API returns {"categories": [...]}
    if isinstance(data, list):
        categories = data
    elif isinstance(data, dict):
        categories = data.get("categories", [])
    else:
        categories = []

    existing_slugs = {
        category.get("slug")
        for category in categories
        if category.get("slug")
    }

    print(f"Found {len(existing_slugs)} existing categories.")

    return existing_slugs


# ------------------------------------------------------------
# Create categories
# ------------------------------------------------------------

def create_category(name, slug):
    payload = {
        "name": name,
        "slug": slug,
    }

    response = requests.post(
        f"{BASE_URL}/categories",
        headers=HEADERS,
        json=payload,
        timeout=15,
    )

    if response.status_code in (200, 201):
        print(f"  [+] Created: {name:<20} -> {slug}")
        return True

    print(f"  [!] Failed:  {name:<20} -> {slug}")
    print(f"      HTTP {response.status_code}: {response.text}")

    return False


# ------------------------------------------------------------
# Main
# ------------------------------------------------------------

def main():
    if TOKEN == "PASTE_YOUR_ADMIN_JWT_HERE":
        print("ERROR: Add your admin JWT token to TOKEN first.")
        sys.exit(1)

    existing_slugs = get_existing_categories()

    print("\nCreating WearIT categories...\n")

    created = 0
    skipped = 0
    failed = 0

    for name, slug in CATEGORIES:

        if slug in existing_slugs:
            print(f"  [-] Skipped:  {name:<20} -> already exists")
            skipped += 1
            continue

        if create_category(name, slug):
            created += 1
            existing_slugs.add(slug)
        else:
            failed += 1

    print("\n" + "=" * 55)
    print("WearIT Category Seeding Complete")
    print("=" * 55)
    print(f"Created : {created}")
    print(f"Skipped : {skipped}")
    print(f"Failed  : {failed}")
    print("=" * 55)


if __name__ == "__main__":
    main()