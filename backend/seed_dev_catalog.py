import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db.base import Base
from db.session import SessionLocal, engine
from models.category import Category
from models.product import Product
from models.review import Review
from models.user import User
from models.user_profile import UserProfile
from models.wishlist import Wishlist
from models.user_product_interaction import UserProductInteraction
from models.product_metadata import ProductMetadata
from models.size import Size
from models.product_size import ProductSize

# Categories Slug Mapping
# Assumes Categories exist: 
# topwear -> kurtas, t-shirts, shirts, hoodies, jackets
# bottomwear -> jeans, pajamas, ethnic-bottoms, trousers, shorts, skirts, leggings
# footwear -> sneakers, sandals, boots, heels
# accessories -> watches, bags, jewelry, belts

PRODUCTS_DATA = [
    # ==================== MALE LOOKS ====================
    # 1. Male Festive / Ethnic
    {
        "name": "Silk Blend Embroidered Kurta",
        "category_slug": "kurtas",
        "price": 2499,
        "quantity": 50,
        "sizes": ["M", "L", "XL"],
        "metadata": {
            "fit_type": "Regular", "gender_target": "Male", "color": "Maroon",
            "material": "Silk Blend", "pattern": "Embroidered",
            "season": ["All Season"], "occasion": ["Festive", "Ethnic", "Wedding"], "style": "Ethnic"
        }
    },
    {
        "name": "Classic Cream Pyjama",
        "category_slug": "pajamas",
        "price": 1299,
        "quantity": 40,
        "sizes": ["30", "32", "34"],
        "metadata": {
            "fit_type": "Relaxed", "gender_target": "Male", "color": "Cream",
            "material": "Cotton", "pattern": "Solid",
            "season": ["All Season"], "occasion": ["Festive", "Ethnic", "Wedding"], "style": "Ethnic"
        }
    },
    {
        "name": "Handcrafted Leather Kolhapuri Mojris",
        "category_slug": "sandals",
        "price": 1799,
        "quantity": 30,
        "sizes": ["8", "9", "10"],
        "metadata": {
            "fit_type": "Regular", "gender_target": "Male", "color": "Tan",
            "material": "Leather", "pattern": "Textured",
            "season": ["All Season"], "occasion": ["Festive", "Ethnic", "Wedding"], "style": "Ethnic"
        }
    },

    # 2. Male Formal / Office
    {
        "name": "Structured Cotton Formal Shirt",
        "category_slug": "shirts",
        "price": 1899,
        "quantity": 45,
        "sizes": ["S", "M", "L", "XL"],
        "metadata": {
            "fit_type": "Slim", "gender_target": "Male", "color": "Light Blue",
            "material": "Cotton", "pattern": "Solid",
            "season": ["All Season"], "occasion": ["Formal", "Office"], "style": "Formal"
        }
    },
    {
        "name": "Tailored Formal Trousers",
        "category_slug": "trousers",
        "price": 2199,
        "quantity": 35,
        "sizes": ["30", "32", "34", "36"],
        "metadata": {
            "fit_type": "Slim", "gender_target": "Male", "color": "Charcoal Grey",
            "material": "Poly-Viscose", "pattern": "Solid",
            "season": ["All Season"], "occasion": ["Formal", "Office"], "style": "Formal"
        }
    },
    {
        "name": "Oxford Leather Dress Shoes",
        "category_slug": "sandals", # Or formal footwear category
        "price": 2999,
        "quantity": 25,
        "sizes": ["8", "9", "10"],
        "metadata": {
            "fit_type": "Regular", "gender_target": "Male", "color": "Black",
            "material": "Leather", "pattern": "Solid",
            "season": ["All Season"], "occasion": ["Formal", "Office"], "style": "Formal"
        }
    },

    # 3. Male Party / Clubwear
    {
        "name": "Metallic Satin Party Shirt",
        "category_slug": "shirts",
        "price": 2299,
        "quantity": 30,
        "sizes": ["M", "L", "XL"],
        "metadata": {
            "fit_type": "Slim", "gender_target": "Male", "color": "Black",
            "material": "Satin", "pattern": "Solid",
            "season": ["All Season"], "occasion": ["Party"], "style": "Modern"
        }
    },

    # ==================== FEMALE LOOKS ====================
    # 4. Female Festive / Ethnic
    {
        "name": "Chanderi Silk Anarkali Kurta",
        "category_slug": "kurtas",
        "price": 3299,
        "quantity": 35,
        "sizes": ["S", "M", "L"],
        "metadata": {
            "fit_type": "Regular", "gender_target": "Female", "color": "Mustard Yellow",
            "material": "Silk", "pattern": "Printed",
            "season": ["All Season"], "occasion": ["Festive", "Ethnic", "Wedding"], "style": "Ethnic"
        }
    },
    {
        "name": "Stretchable Cotton Leggings",
        "category_slug": "ethnic-bottoms",
        "price": 799,
        "quantity": 50,
        "sizes": ["S", "M", "L"],
        "metadata": {
            "fit_type": "Slim", "gender_target": "Female", "color": "Golden",
            "material": "Cotton", "pattern": "Solid",
            "season": ["All Season"], "occasion": ["Festive", "Ethnic", "Wedding"], "style": "Ethnic"
        }
    },
    {
        "name": "Embellished Block Heel Sandals",
        "category_slug": "heels",
        "price": 2199,
        "quantity": 20,
        "sizes": ["6", "7", "8"],
        "metadata": {
            "fit_type": "Regular", "gender_target": "Female", "color": "Gold",
            "material": "Synthetic", "pattern": "Embellished",
            "season": ["All Season"], "occasion": ["Festive", "Ethnic", "Wedding", "Party"], "style": "Ethnic"
        }
    },

    # 5. Female Formal / Office
    {
        "name": "Button-Down Formal Satin Blouse",
        "category_slug": "shirts",
        "price": 1699,
        "quantity": 40,
        "sizes": ["XS", "S", "M", "L"],
        "metadata": {
            "fit_type": "Slim", "gender_target": "Female", "color": "White",
            "material": "Satin", "pattern": "Solid",
            "season": ["All Season"], "occasion": ["Formal", "Office"], "style": "Formal"
        }
    },
    {
        "name": "High-Waisted Ankle Length Trousers",
        "category_slug": "trousers",
        "price": 1999,
        "quantity": 30,
        "sizes": ["26", "28", "30", "32"],
        "metadata": {
            "fit_type": "Slim", "gender_target": "Female", "color": "Navy Blue",
            "material": "Poly-Cotton", "pattern": "Solid",
            "season": ["All Season"], "occasion": ["Formal", "Office"], "style": "Formal"
        }
    },

    # ==================== UNISEX / CASUAL / SPORTS ====================
    # 6. Unisex Casual / Everyday
    {
        "name": "Heavyweight Oversized Unisex Graphic Tee",
        "category_slug": "t-shirts",
        "price": 1199,
        "quantity": 60,
        "sizes": ["S", "M", "L", "XL"],
        "metadata": {
            "fit_type": "Relaxed", "gender_target": "Unisex", "color": "Beige",
            "material": "Cotton", "pattern": "Graphic",
            "season": ["Summer", "All Season"], "occasion": ["Casual"], "style": "Streetwear"
        }
    },
    {
        "name": "Unisex Classic Blue Straight Denim Jeans",
        "category_slug": "jeans",
        "price": 2499,
        "quantity": 50,
        "sizes": ["28", "30", "32", "34"],
        "metadata": {
            "fit_type": "Regular", "gender_target": "Unisex", "color": "Blue",
            "material": "Denim", "pattern": "Solid",
            "season": ["All Season"], "occasion": ["Casual"], "style": "Casual"
        }
    },
    {
        "name": "Minimalist White Leather Sneakers",
        "category_slug": "sneakers",
        "price": 2799,
        "quantity": 40,
        "sizes": ["7", "8", "9", "10"],
        "metadata": {
            "fit_type": "Regular", "gender_target": "Unisex", "color": "White",
            "material": "Leather", "pattern": "Solid",
            "season": ["All Season"], "occasion": ["Casual", "Office", "Party"], "style": "Minimal"
        }
    },

    # 7. Unisex Sports / Activewear
    {
        "name": "Dry-Fit Performance Sports Tee",
        "category_slug": "t-shirts",
        "price": 899,
        "quantity": 45,
        "sizes": ["S", "M", "L", "XL"],
        "metadata": {
            "fit_type": "Slim", "gender_target": "Unisex", "color": "Neon Green",
            "material": "Polyester", "pattern": "Solid",
            "season": ["All Season"], "occasion": ["Sports"], "style": "Sporty"
        }
    },
    {
        "name": "Athletic Running Shorts",
        "category_slug": "shorts",
        "price": 999,
        "quantity": 40,
        "sizes": ["28", "30", "32", "34"],
        "metadata": {
            "fit_type": "Regular", "gender_target": "Unisex", "color": "Black",
            "material": "Polyester", "pattern": "Solid",
            "season": ["Summer", "All Season"], "occasion": ["Sports"], "style": "Sporty"
        }
    },

    # ==================== ACCESSORIES ====================
    {
        "name": "Classic Chronograph Leather Watch",
        "category_slug": "watches",
        "price": 3499,
        "quantity": 20,
        "sizes": ["Free Size"],
        "metadata": {
            "fit_type": "Regular", "gender_target": "Unisex", "color": "Brown",
            "material": "Leather", "pattern": "Solid",
            "season": ["All Season"], "occasion": ["Formal", "Office", "Party", "Casual"], "style": "Formal"
        }
    },
    {
        "name": "Ethnic Kundan Jhumka Earrings",
        "category_slug": "jewelry",
        "price": 1299,
        "quantity": 25,
        "sizes": ["Free Size"],
        "metadata": {
            "fit_type": "Regular", "gender_target": "Female", "color": "Gold",
            "material": "Brass", "pattern": "Traditional",
            "season": ["All Season"], "occasion": ["Festive", "Ethnic", "Wedding"], "style": "Ethnic"
        }
    }
]

def slugify(name):
    return name.lower().replace(" ", "-").replace("&", "and")

def seed():
    db = SessionLocal()
    try:
        print("Seeding catalog for all occasions (Male, Female, Unisex)...")

        # Pre-fetch categories and sizes
        categories = {c.slug: c.id for c in db.query(Category).all()}
        db_sizes = {s.name: s.id for s in db.query(Size).all()}

        for p_data in PRODUCTS_DATA:
            cat_slug = p_data["category_slug"]
            category_id = categories.get(cat_slug)
            
            if not category_id:
                print(f"[SKIP] Category slug '{cat_slug}' not found in DB!")
                continue

            # Create Product
            product = Product(
                name=p_data["name"],
                slug=slugify(p_data["name"]),
                description=f"High quality {p_data['name']} suited for multi-occasion wear.",
                price=p_data["price"],
                discount_price=p_data["price"] - 200,
                quantity=p_data["quantity"],
                brand="WearIt",
                category_id=category_id,
                image_url="https://via.placeholder.com/300x400"
            )
            db.add(product)
            db.flush()

            # Attach Metadata
            md = p_data["metadata"]
            metadata = ProductMetadata(
                product_id=product.id,
                fit_type=md["fit_type"],
                gender_target=md["gender_target"],
                color=md["color"],
                material=md["material"],
                pattern=md["pattern"],
                season=md["season"],
                occasion=md["occasion"],
                style=md["style"]
            )
            db.add(metadata)

            # Attach Sizes & Stock
            for size_name in p_data["sizes"]:
                size_id = db_sizes.get(size_name)
                if size_id:
                    ps = ProductSize(
                        product_id=product.id,
                        size_id=size_id,
                        stock=10
                    )
                    db.add(ps)

        db.commit()
        print("Successfully seeded all-occasion catalog!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()