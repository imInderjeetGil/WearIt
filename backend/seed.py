from db.session import SessionLocal

from seeds.categories import seed_categories
from seeds.sizes import seed_sizes
from seeds.colors import seed_colors
from seeds.products import seed_products
from seeds.relations import seed_product_relations


def main():
    db = SessionLocal()

    try:
        print("=" * 50)
        print("🌱 Starting Database Seeding...")
        print("=" * 50)

        print("📂 Seeding Categories...")
        seed_categories(db)

        print("📏 Seeding Sizes...")
        seed_sizes(db)

        print("🎨 Seeding Colors...")
        seed_colors(db)

        print("👕 Seeding Products...")
        seed_products(db)


        print("🔗 Seeding Product Relations...")
        seed_product_relations(db)

        print("=" * 50)
        print("✅ Database Seeded Successfully!")
        print("=" * 50)

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")

    finally:
        db.close()


if __name__ == "__main__":
    main()