import sys
import requests

# ============================================================
# WearIT — Production Catalog Seeder
# 50 realistic clothing products
# ============================================================

BASE_URL = "http://localhost:8000"

# Paste your CURRENT admin JWT here.
# Do NOT include "Bearer ".
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3ODcwMjUxNjJ9.C5Q9GLwyrSizUPxj8Qx-t-0XZIkQYnFPFUNozkWrr4Q"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
}


# ============================================================
# SIZE MASTER
# ============================================================

SIZE_NAMES = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "28",
    "30",
    "32",
    "34",
    "36",
    "38",
]


# ============================================================
# PRODUCT CATALOG
# ============================================================

PRODUCTS = [

    # --------------------------------------------------------
    # T-SHIRTS — 10
    # --------------------------------------------------------

    {
        "name": "Essential Heavyweight Cotton Tee",
        "slug": "essential-heavyweight-cotton-tee",
        "description": "A clean everyday essential made from heavyweight cotton jersey with a structured crew neckline and comfortable regular fit. Designed with a minimal solid finish.",
        "price": 1299,
        "discount_price": 899,
        "quantity": 55,
        "brand": "WearIT",
        "category": "t-shirts",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Regular", "Unisex", "Black", "Cotton", "Solid", "All Season", "Casual", "Minimal"],
    },

    {
        "name": "Oversized Street Graphic Tee",
        "slug": "oversized-street-graphic-tee",
        "description": "A relaxed oversized T-shirt featuring a bold graphic print and dropped shoulders. Crafted from soft cotton jersey for a comfortable streetwear silhouette.",
        "price": 1499,
        "discount_price": 999,
        "quantity": 42,
        "brand": "WearIT",
        "category": "t-shirts",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Oversized", "Unisex", "Black", "Cotton", "Graphic", "All Season", "Streetwear", "Streetwear"],
    },

    {
        "name": "Classic Essential Crewneck Tee",
        "slug": "classic-essential-crewneck-tee",
        "description": "A versatile crewneck T-shirt with a clean silhouette and breathable cotton construction. An everyday staple designed for effortless casual outfits.",
        "price": 999,
        "discount_price": 699,
        "quantity": 70,
        "brand": "WearIT",
        "category": "t-shirts",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Regular", "Unisex", "White", "Cotton", "Plain", "Summer", "Casual", "Minimal"],
    },

    {
        "name": "Relaxed Premium Cotton Tee",
        "slug": "relaxed-premium-cotton-tee",
        "description": "A premium relaxed-fit T-shirt cut from soft cotton jersey. The understated design makes it an easy choice for everyday wear.",
        "price": 1399,
        "discount_price": 949,
        "quantity": 38,
        "brand": "WearIT",
        "category": "t-shirts",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Relaxed", "Male", "Green", "Cotton", "Solid", "All Season", "Casual", "Casual"],
    },

    {
        "name": "Minimal Ribbed T-Shirt",
        "slug": "minimal-ribbed-t-shirt",
        "description": "A refined fitted T-shirt with a soft ribbed construction and subtle stretch. Designed to work equally well on its own or layered under jackets.",
        "price": 1199,
        "discount_price": 799,
        "quantity": 35,
        "brand": "WearIT",
        "category": "t-shirts",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Slim", "Female", "Beige", "Blended", "Plain", "All Season", "Casual", "Minimal"],
    },

    {
        "name": "Vintage Washed Graphic Tee",
        "slug": "vintage-washed-graphic-tee",
        "description": "A vintage-inspired oversized T-shirt with a washed finish and statement graphic detailing. Soft cotton construction delivers a broken-in feel.",
        "price": 1599,
        "discount_price": 1099,
        "quantity": 30,
        "brand": "WearIT",
        "category": "t-shirts",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Oversized", "Unisex", "Grey", "Cotton", "Graphic", "All Season", "Casual", "Vintage"],
    },

    {
        "name": "Everyday Striped T-Shirt",
        "slug": "everyday-striped-t-shirt",
        "description": "A classic striped crewneck T-shirt made from breathable cotton. Its relaxed everyday silhouette makes it an easy pairing for jeans, trousers and shorts.",
        "price": 1099,
        "discount_price": 749,
        "quantity": 48,
        "brand": "WearIT",
        "category": "t-shirts",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Regular", "Unisex", "Navy", "Cotton", "Striped", "Summer", "Casual", "Casual"],
    },

    {
        "name": "Performance Active T-Shirt",
        "slug": "performance-active-t-shirt",
        "description": "A lightweight performance T-shirt designed for training and active days. Technical fabric and a streamlined fit keep movement unrestricted.",
        "price": 1299,
        "discount_price": 899,
        "quantity": 45,
        "brand": "WearIT",
        "category": "t-shirts",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Regular", "Unisex", "Grey", "Polyester", "Solid", "Summer", "Sports", "Sport"],
    },

    {
        "name": "Premium Cotton Polo",
        "slug": "premium-cotton-polo",
        "description": "A polished cotton polo featuring a structured collar, clean button placket and refined regular fit. Built for smart everyday dressing.",
        "price": 1599,
        "discount_price": 1199,
        "quantity": 32,
        "brand": "WearIT",
        "category": "t-shirts",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Regular", "Male", "Navy", "Cotton", "Solid", "All Season", "Casual", "Formal"],
    },

    {
        "name": "Boxy Essential T-Shirt",
        "slug": "boxy-essential-t-shirt",
        "description": "A contemporary boxy-fit T-shirt with a clean neckline and soft cotton construction. Designed for a modern relaxed silhouette.",
        "price": 1299,
        "discount_price": 899,
        "quantity": 36,
        "brand": "WearIT",
        "category": "t-shirts",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Oversized", "Female", "White", "Cotton", "Solid", "All Season", "Casual", "Minimal"],
    },


    # --------------------------------------------------------
    # SHIRTS — 6
    # --------------------------------------------------------

    {
        "name": "Classic Oxford Button Down Shirt",
        "slug": "classic-oxford-button-down-shirt",
        "description": "A timeless Oxford shirt crafted from breathable cotton with a button-down collar and clean regular silhouette. A versatile foundation for work and weekends.",
        "price": 1899,
        "discount_price": 1399,
        "quantity": 28,
        "brand": "WearIT",
        "category": "shirts",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Regular", "Male", "White", "Cotton", "Plain", "All Season", "Office", "Formal"],
    },

    {
        "name": "Relaxed Linen Resort Shirt",
        "slug": "relaxed-linen-resort-shirt",
        "description": "A breathable linen shirt with a relaxed silhouette and easy resort-inspired styling. Lightweight construction makes it ideal for warm-weather dressing.",
        "price": 1999,
        "discount_price": 1499,
        "quantity": 25,
        "brand": "WearIT",
        "category": "shirts",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Relaxed", "Unisex", "Beige", "Linen", "Plain", "Summer", "Casual", "Minimal"],
    },

    {
        "name": "Oversized Checked Flannel Shirt",
        "slug": "oversized-checked-flannel-shirt",
        "description": "A warm brushed flannel shirt with an oversized silhouette and classic checked pattern. Wear it buttoned or open over a basic tee.",
        "price": 1799,
        "discount_price": 1299,
        "quantity": 30,
        "brand": "WearIT",
        "category": "shirts",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Oversized", "Unisex", "Red", "Cotton", "Checked", "Winter", "Casual", "Streetwear"],
    },

    {
        "name": "Satin Relaxed Shirt",
        "slug": "satin-relaxed-shirt",
        "description": "A fluid satin-inspired shirt designed with a relaxed silhouette and elegant drape. A versatile piece for elevated evenings and contemporary styling.",
        "price": 1899,
        "discount_price": 1399,
        "quantity": 22,
        "brand": "WearIT",
        "category": "shirts",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Relaxed", "Female", "Maroon", "Silk", "Plain", "All Season", "Party", "Luxury"],
    },

    {
        "name": "Denim Utility Shirt",
        "slug": "denim-utility-shirt",
        "description": "A durable denim shirt featuring utility-inspired chest pockets and a structured relaxed fit. Designed as a versatile layering piece.",
        "price": 2099,
        "discount_price": 1599,
        "quantity": 24,
        "brand": "WearIT",
        "category": "shirts",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Relaxed", "Male", "Blue", "Denim", "Plain", "All Season", "Casual", "Streetwear"],
    },

    {
        "name": "Cropped Casual Shirt",
        "slug": "cropped-casual-shirt",
        "description": "A contemporary cropped shirt with a clean collar and relaxed proportions. Designed for modern everyday styling with jeans or trousers.",
        "price": 1699,
        "discount_price": 1199,
        "quantity": 26,
        "brand": "WearIT",
        "category": "shirts",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Relaxed", "Female", "Blue", "Cotton", "Plain", "Summer", "Casual", "Minimal"],
    },


    # --------------------------------------------------------
    # JEANS — 6
    # --------------------------------------------------------

    {
        "name": "Classic Straight Fit Jeans",
        "slug": "classic-straight-fit-jeans",
        "description": "Classic five-pocket jeans with a straight-leg silhouette and durable denim construction. A timeless everyday staple designed for versatility.",
        "price": 2299,
        "discount_price": 1699,
        "quantity": 35,
        "brand": "WearIT",
        "category": "jeans",
        "sizes": ["28", "30", "32", "34", "36", "38"],
        "meta": ["Regular", "Male", "Blue", "Denim", "Plain", "All Season", "Casual", "Casual"],
    },

    {
        "name": "Relaxed Baggy Jeans",
        "slug": "relaxed-baggy-jeans",
        "description": "Relaxed baggy jeans with a contemporary wide silhouette and comfortable construction. Designed for modern streetwear outfits.",
        "price": 2499,
        "discount_price": 1799,
        "quantity": 30,
        "brand": "WearIT",
        "category": "jeans",
        "sizes": ["28", "30", "32", "34", "36"],
        "meta": ["Relaxed", "Unisex", "Blue", "Denim", "Plain", "All Season", "Streetwear", "Streetwear"],
    },

    {
        "name": "Slim Stretch Jeans",
        "slug": "slim-stretch-jeans",
        "description": "Clean slim-fit jeans made with a touch of stretch for everyday comfort and unrestricted movement. Finished with a versatile dark wash.",
        "price": 2399,
        "discount_price": 1699,
        "quantity": 32,
        "brand": "WearIT",
        "category": "jeans",
        "sizes": ["28", "30", "32", "34", "36", "38"],
        "meta": ["Slim", "Male", "Blue", "Denim", "Plain", "All Season", "Casual", "Minimal"],
    },

    {
        "name": "High Rise Straight Jeans",
        "slug": "high-rise-straight-jeans",
        "description": "High-rise jeans with a clean straight-leg silhouette and classic five-pocket construction. Designed to pair easily with fitted tops and relaxed shirts.",
        "price": 2399,
        "discount_price": 1699,
        "quantity": 34,
        "brand": "WearIT",
        "category": "jeans",
        "sizes": ["28", "30", "32", "34"],
        "meta": ["Regular", "Female", "Blue", "Denim", "Plain", "All Season", "Casual", "Casual"],
    },

    {
        "name": "Wide Leg Vintage Jeans",
        "slug": "wide-leg-vintage-jeans",
        "description": "Vintage-inspired wide-leg jeans featuring a relaxed silhouette and lightly washed finish. A statement everyday piece for contemporary wardrobes.",
        "price": 2599,
        "discount_price": 1899,
        "quantity": 27,
        "brand": "WearIT",
        "category": "jeans",
        "sizes": ["26", "28", "30", "32", "34"],
        "meta": ["Relaxed", "Female", "Blue", "Denim", "Plain", "All Season", "Casual", "Vintage"],
    },

    {
        "name": "Black Tapered Jeans",
        "slug": "black-tapered-jeans",
        "description": "Versatile black jeans with a tapered silhouette and subtle stretch for comfortable everyday wear. An easy foundation for casual outfits.",
        "price": 2299,
        "discount_price": 1599,
        "quantity": 40,
        "brand": "WearIT",
        "category": "jeans",
        "sizes": ["28", "30", "32", "34", "36", "38"],
        "meta": ["Slim", "Male", "Black", "Denim", "Plain", "All Season", "Casual", "Minimal"],
    },


    # --------------------------------------------------------
    # PANTS — 5
    # --------------------------------------------------------

    {
        "name": "Relaxed Cotton Cargo Pants",
        "slug": "relaxed-cotton-cargo-pants",
        "description": "Utility-inspired cargo pants made from durable cotton with multiple functional pockets and a relaxed silhouette.",
        "price": 2199,
        "discount_price": 1599,
        "quantity": 31,
        "brand": "WearIT",
        "category": "pants",
        "sizes": ["28", "30", "32", "34", "36", "38"],
        "meta": ["Relaxed", "Male", "Green", "Cotton", "Plain", "All Season", "Casual", "Streetwear"],
    },

    {
        "name": "Wide Leg Tailored Pants",
        "slug": "wide-leg-tailored-pants",
        "description": "Contemporary wide-leg pants with a clean tailored finish and fluid drape. Designed to elevate everyday outfits.",
        "price": 2299,
        "discount_price": 1699,
        "quantity": 25,
        "brand": "WearIT",
        "category": "pants",
        "sizes": ["26", "28", "30", "32", "34"],
        "meta": ["Relaxed", "Female", "Beige", "Blended", "Plain", "All Season", "Office", "Minimal"],
    },

    {
        "name": "Everyday Straight Cotton Pants",
        "slug": "everyday-straight-cotton-pants",
        "description": "Straight-fit cotton pants designed for everyday comfort. A versatile alternative to denim with a clean minimal finish.",
        "price": 1999,
        "discount_price": 1399,
        "quantity": 38,
        "brand": "WearIT",
        "category": "pants",
        "sizes": ["28", "30", "32", "34", "36", "38"],
        "meta": ["Regular", "Unisex", "Beige", "Cotton", "Plain", "All Season", "Casual", "Casual"],
    },

    {
        "name": "Utility Parachute Pants",
        "slug": "utility-parachute-pants",
        "description": "Relaxed parachute pants featuring lightweight construction and adjustable details for a modern utility-inspired silhouette.",
        "price": 2199,
        "discount_price": 1599,
        "quantity": 29,
        "brand": "WearIT",
        "category": "pants",
        "sizes": ["S", "M", "L", "XL"],
        "meta": ["Oversized", "Unisex", "Grey", "Nylon", "Plain", "All Season", "Streetwear", "Streetwear"],
    },

    {
        "name": "High Rise Straight Pants",
        "slug": "high-rise-straight-pants",
        "description": "High-rise straight pants with a polished silhouette and clean waistband. Designed for refined office and smart everyday outfits.",
        "price": 2099,
        "discount_price": 1499,
        "quantity": 24,
        "brand": "WearIT",
        "category": "pants",
        "sizes": ["26", "28", "30", "32", "34"],
        "meta": ["Regular", "Female", "Black", "Blended", "Plain", "All Season", "Office", "Formal"],
    },


    # --------------------------------------------------------
    # TROUSERS — 4
    # --------------------------------------------------------

    {
        "name": "Classic Pleated Trousers",
        "slug": "classic-pleated-trousers",
        "description": "Tailored pleated trousers with a structured waistband and clean straight silhouette. Designed for polished formal and office dressing.",
        "price": 2299,
        "discount_price": 1699,
        "quantity": 22,
        "brand": "WearIT",
        "category": "trousers",
        "sizes": ["28", "30", "32", "34", "36", "38"],
        "meta": ["Regular", "Male", "Grey", "Blended", "Plain", "All Season", "Formal", "Formal"],
    },

    {
        "name": "Relaxed Linen Trousers",
        "slug": "relaxed-linen-trousers",
        "description": "Lightweight linen trousers with a relaxed silhouette and breathable construction, ideal for warm-weather everyday dressing.",
        "price": 2399,
        "discount_price": 1799,
        "quantity": 20,
        "brand": "WearIT",
        "category": "trousers",
        "sizes": ["28", "30", "32", "34", "36"],
        "meta": ["Relaxed", "Female", "Beige", "Linen", "Plain", "Summer", "Casual", "Minimal"],
    },

    {
        "name": "Smart Tapered Trousers",
        "slug": "smart-tapered-trousers",
        "description": "Tapered trousers designed to bridge casual and formal dressing. Features a clean finish and comfortable blended construction.",
        "price": 2199,
        "discount_price": 1599,
        "quantity": 27,
        "brand": "WearIT",
        "category": "trousers",
        "sizes": ["28", "30", "32", "34", "36", "38"],
        "meta": ["Slim", "Male", "Navy", "Blended", "Plain", "All Season", "Office", "Formal"],
    },

    {
        "name": "Wide Leg Pleated Trousers",
        "slug": "wide-leg-pleated-trousers",
        "description": "Modern wide-leg trousers with elegant pleating and fluid drape. Designed as a versatile statement piece for elevated outfits.",
        "price": 2399,
        "discount_price": 1799,
        "quantity": 21,
        "brand": "WearIT",
        "category": "trousers",
        "sizes": ["26", "28", "30", "32", "34"],
        "meta": ["Oversized", "Female", "Brown", "Rayon", "Plain", "All Season", "Party", "Luxury"],
    },


    # --------------------------------------------------------
    # TOPS — 5
    # --------------------------------------------------------

    {
        "name": "Ribbed Everyday Tank Top",
        "slug": "ribbed-everyday-tank-top",
        "description": "A versatile ribbed tank top made from a soft blended fabric. Designed for effortless everyday wear and easy layering.",
        "price": 899,
        "discount_price": 599,
        "quantity": 45,
        "brand": "WearIT",
        "category": "tops",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Slim", "Female", "White", "Blended", "Plain", "Summer", "Casual", "Minimal"],
    },

    {
        "name": "Relaxed Boxy Crop Top",
        "slug": "relaxed-boxy-crop-top",
        "description": "A contemporary boxy crop top with a relaxed silhouette and clean neckline. Designed for modern casual outfits.",
        "price": 999,
        "discount_price": 699,
        "quantity": 35,
        "brand": "WearIT",
        "category": "tops",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Oversized", "Female", "Black", "Cotton", "Plain", "Summer", "Casual", "Streetwear"],
    },

    {
        "name": "Soft Drape Blouse",
        "slug": "soft-drape-blouse",
        "description": "An elegant blouse with a soft drape and relaxed silhouette. A versatile piece for office and evening styling.",
        "price": 1499,
        "discount_price": 1099,
        "quantity": 23,
        "brand": "WearIT",
        "category": "tops",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Relaxed", "Female", "White", "Rayon", "Plain", "All Season", "Office", "Luxury"],
    },

    {
        "name": "Striped Relaxed Long Sleeve Top",
        "slug": "striped-relaxed-long-sleeve-top",
        "description": "A comfortable long-sleeve top with classic stripes and a relaxed silhouette. Easy to style with denim or tailored trousers.",
        "price": 1199,
        "discount_price": 799,
        "quantity": 31,
        "brand": "WearIT",
        "category": "tops",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Relaxed", "Female", "Navy", "Cotton", "Striped", "All Season", "Casual", "Casual"],
    },

    {
        "name": "Minimal Square Neck Top",
        "slug": "minimal-square-neck-top",
        "description": "A refined square-neck top with a flattering clean silhouette and soft stretch fabric. Designed as a versatile wardrobe essential.",
        "price": 1099,
        "discount_price": 749,
        "quantity": 28,
        "brand": "WearIT",
        "category": "tops",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Slim", "Female", "Maroon", "Blended", "Plain", "All Season", "Party", "Minimal"],
    },


    # --------------------------------------------------------
    # DRESSES — 5
    # --------------------------------------------------------

    {
        "name": "Minimal Midi Shirt Dress",
        "slug": "minimal-midi-shirt-dress",
        "description": "A clean midi-length shirt dress with a relaxed silhouette and understated detailing. Designed for effortless everyday elegance.",
        "price": 2199,
        "discount_price": 1599,
        "quantity": 24,
        "brand": "WearIT",
        "category": "dresses",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Relaxed", "Female", "Black", "Cotton", "Plain", "All Season", "Casual", "Minimal"],
    },

    {
        "name": "Floral Summer Midi Dress",
        "slug": "floral-summer-midi-dress",
        "description": "A lightweight midi dress featuring a soft floral print and comfortable flowing silhouette. Designed for warm-weather days and relaxed occasions.",
        "price": 2299,
        "discount_price": 1699,
        "quantity": 22,
        "brand": "WearIT",
        "category": "dresses",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Regular", "Female", "Blue", "Rayon", "Floral", "Summer", "Casual", "Casual"],
    },

    {
        "name": "Satin Evening Slip Dress",
        "slug": "satin-evening-slip-dress",
        "description": "An elegant satin slip dress with a fluid silhouette and refined finish. Designed for evening occasions and elevated styling.",
        "price": 2499,
        "discount_price": 1899,
        "quantity": 18,
        "brand": "WearIT",
        "category": "dresses",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Slim", "Female", "Green", "Silk", "Plain", "All Season", "Party", "Luxury"],
    },

    {
        "name": "Relaxed Cotton Shirt Dress",
        "slug": "relaxed-cotton-shirt-dress",
        "description": "An easy cotton shirt dress with a relaxed silhouette, button front and practical everyday styling. Lightweight and comfortable for warm days.",
        "price": 1999,
        "discount_price": 1499,
        "quantity": 26,
        "brand": "WearIT",
        "category": "dresses",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Relaxed", "Female", "Green", "Cotton", "Plain", "Summer", "Casual", "Casual"],
    },

    {
        "name": "Classic Wrap Dress",
        "slug": "classic-wrap-dress",
        "description": "A flattering wrap-style dress with an adjustable waist and elegant flowing silhouette. Suitable for daytime and evening occasions.",
        "price": 2399,
        "discount_price": 1799,
        "quantity": 20,
        "brand": "WearIT",
        "category": "dresses",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Regular", "Female", "Maroon", "Rayon", "Plain", "All Season", "Party", "Luxury"],
    },


    # --------------------------------------------------------
    # HOODIES — 3
    # --------------------------------------------------------

    {
        "name": "Essential Heavyweight Pullover Hoodie",
        "slug": "essential-heavyweight-pullover-hoodie",
        "description": "A heavyweight fleece hoodie with a relaxed silhouette, adjustable hood and clean minimal finish. Built for comfortable everyday layering.",
        "price": 2299,
        "discount_price": 1699,
        "quantity": 35,
        "brand": "WearIT",
        "category": "hoodies",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Relaxed", "Unisex", "Black", "Blended", "Plain", "Winter", "Casual", "Minimal"],
    },

    {
        "name": "Oversized Graphic Hoodie",
        "slug": "oversized-graphic-hoodie",
        "description": "An oversized hoodie featuring a bold graphic treatment and dropped shoulders. Designed for a relaxed streetwear aesthetic.",
        "price": 2499,
        "discount_price": 1899,
        "quantity": 27,
        "brand": "WearIT",
        "category": "hoodies",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Oversized", "Unisex", "Grey", "Blended", "Graphic", "Winter", "Streetwear", "Streetwear"],
    },

    {
        "name": "Cropped Zip Hoodie",
        "slug": "cropped-zip-hoodie",
        "description": "A contemporary cropped zip-up hoodie with a soft interior and relaxed silhouette. Ideal for casual layering and athleisure outfits.",
        "price": 2199,
        "discount_price": 1599,
        "quantity": 24,
        "brand": "WearIT",
        "category": "hoodies",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Relaxed", "Female", "Grey", "Blended", "Plain", "Winter", "Sports", "Sport"],
    },


    # --------------------------------------------------------
    # SWEATSHIRTS — 2
    # --------------------------------------------------------

    {
        "name": "Classic Crewneck Sweatshirt",
        "slug": "classic-crewneck-sweatshirt",
        "description": "A soft crewneck sweatshirt with a classic silhouette and ribbed trims. A dependable layering essential for cooler days.",
        "price": 1899,
        "discount_price": 1399,
        "quantity": 34,
        "brand": "WearIT",
        "category": "sweatshirts",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Regular", "Unisex", "Navy", "Blended", "Plain", "Winter", "Casual", "Casual"],
    },

    {
        "name": "Oversized Minimal Sweatshirt",
        "slug": "oversized-minimal-sweatshirt",
        "description": "A clean oversized sweatshirt with dropped shoulders and soft brushed construction. Designed for modern relaxed styling.",
        "price": 1999,
        "discount_price": 1499,
        "quantity": 29,
        "brand": "WearIT",
        "category": "sweatshirts",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Oversized", "Unisex", "Beige", "Blended", "Plain", "Winter", "Casual", "Minimal"],
    },


    # --------------------------------------------------------
    # JACKETS — 2
    # --------------------------------------------------------

    {
        "name": "Classic Denim Jacket",
        "slug": "classic-denim-jacket",
        "description": "A timeless denim jacket with a structured silhouette, classic metal buttons and practical chest pockets. Designed for versatile layering.",
        "price": 2799,
        "discount_price": 2099,
        "quantity": 21,
        "brand": "WearIT",
        "category": "jackets",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Regular", "Unisex", "Blue", "Denim", "Plain", "All Season", "Casual", "Vintage"],
    },

    {
        "name": "Oversized Utility Bomber Jacket",
        "slug": "oversized-utility-bomber-jacket",
        "description": "A contemporary bomber jacket combining an oversized silhouette with functional utility-inspired detailing. Designed for statement streetwear layering.",
        "price": 2999,
        "discount_price": 2299,
        "quantity": 18,
        "brand": "WearIT",
        "category": "jackets",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "meta": ["Oversized", "Male", "Black", "Nylon", "Plain", "Winter", "Streetwear", "Streetwear"],
    },


    # --------------------------------------------------------
    # SKIRTS — 2
    # --------------------------------------------------------

    {
        "name": "Pleated Midi Skirt",
        "slug": "pleated-midi-skirt",
        "description": "A refined pleated midi skirt with an elegant flowing silhouette and comfortable waistband. Designed for versatile everyday and smart outfits.",
        "price": 1799,
        "discount_price": 1299,
        "quantity": 22,
        "brand": "WearIT",
        "category": "skirts",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "meta": ["Regular", "Female", "Black", "Polyester", "Plain", "All Season", "Office", "Formal"],
    },

    {
        "name": "A-Line Denim Mini Skirt",
        "slug": "a-line-denim-mini-skirt",
        "description": "A casual A-line denim skirt with a structured silhouette and classic pocket styling. Easy to pair with everyday tops and tees.",
        "price": 1599,
        "discount_price": 1099,
        "quantity": 25,
        "brand": "WearIT",
        "category": "skirts",
        "sizes": ["28", "30", "32", "34"],
        "meta": ["Regular", "Female", "Blue", "Denim", "Plain", "Summer", "Casual", "Casual"],
    },
]


# ============================================================
# VALIDATION
# ============================================================

VALID_FITS = {"Slim", "Regular", "Relaxed", "Oversized"}
VALID_GENDERS = {"Male", "Female", "Unisex"}
VALID_COLORS = {
    "Black", "White", "Grey", "Blue", "Red", "Green",
    "Yellow", "Pink", "Brown", "Beige", "Navy", "Maroon",
    "Orange", "Purple", "Multi"
}
VALID_MATERIALS = {
    "Cotton", "Polyester", "Denim", "Wool", "Silk",
    "Linen", "Nylon", "Rayon", "Leather", "Blended"
}
VALID_PATTERNS = {
    "Solid", "Striped", "Checked", "Floral",
    "Printed", "Graphic", "Camo", "Plain"
}
VALID_SEASONS = {
    "Summer", "Winter", "Monsoon", "Autumn",
    "Spring", "All Season"
}
VALID_OCCASIONS = {
    "Casual", "Formal", "Party", "Sports",
    "Office", "Ethnic", "Streetwear"
}
VALID_STYLES = {
    "Minimal", "Streetwear", "Casual",
    "Formal", "Vintage", "Sport", "Luxury"
}


def validate_catalog():
    print("\nValidating catalog...")

    if len(PRODUCTS) != 50:
        print(f"ERROR: Expected 50 products, found {len(PRODUCTS)}.")
        sys.exit(1)

    slugs = [p["slug"] for p in PRODUCTS]

    if len(slugs) != len(set(slugs)):
        print("ERROR: Duplicate product slug detected.")
        sys.exit(1)

    for p in PRODUCTS:
        fit, gender, color, material, pattern, season, occasion, style = p["meta"]

        checks = [
            ("fit", fit, VALID_FITS),
            ("gender", gender, VALID_GENDERS),
            ("color", color, VALID_COLORS),
            ("material", material, VALID_MATERIALS),
            ("pattern", pattern, VALID_PATTERNS),
            ("season", season, VALID_SEASONS),
            ("occasion", occasion, VALID_OCCASIONS),
            ("style", style, VALID_STYLES),
        ]

        for field, value, allowed in checks:
            if value not in allowed:
                print(
                    f"ERROR: {p['name']} has invalid "
                    f"{field}: {value}"
                )
                sys.exit(1)

    print("Catalog validation passed.")
    print(f"Products: {len(PRODUCTS)}")


# ============================================================
# GET SIZES
# ============================================================

def get_sizes():
    response = requests.get(
        f"{BASE_URL}/sizes",
        timeout=15,
    )

    if response.status_code != 200:
        print("ERROR: Could not fetch sizes.")
        print(response.status_code, response.text)
        sys.exit(1)

    return response.json()


# ============================================================
# CREATE MISSING SIZES
# ============================================================

def ensure_sizes():
    print("\nChecking size master...")

    existing = get_sizes()

    size_map = {
        str(item["name"]): item["id"]
        for item in existing
    }

    for size_name in SIZE_NAMES:

        if size_name in size_map:
            print(
                f"  [-] Size exists: {size_name}"
                f" (ID {size_map[size_name]})"
            )
            continue

        response = requests.post(
            f"{BASE_URL}/sizes",
            headers=HEADERS,
            json={"name": size_name},
            timeout=15,
        )

        if response.status_code not in (200, 201):
            print(
                f"  [!] Failed to create size {size_name}"
                f" | HTTP {response.status_code}"
            )
            print(response.text)
            sys.exit(1)

        created = response.json()
        size_map[size_name] = created["id"]

        print(
            f"  [+] Created size: {size_name}"
            f" (ID {created['id']})"
        )

    return size_map


# ============================================================
# GET CATEGORIES
# ============================================================

def get_categories():
    print("\nFetching categories...")

    response = requests.get(
        f"{BASE_URL}/categories",
        timeout=15,
    )

    if response.status_code != 200:
        print("ERROR: Could not fetch categories.")
        print(response.status_code, response.text)
        sys.exit(1)

    data = response.json()

    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        items = data.get("categories", data.get("items", data.get("data", [])))
    else:
        items = []

    category_map = {
        item["slug"]: item["id"]
        for item in items
        if item.get("slug") and item.get("id") is not None
    }

    print(f"Found {len(category_map)} categories.")

    return category_map


# ============================================================
# GET EXISTING PRODUCTS
# ============================================================

def get_existing_products():
    print("\nChecking existing products...")

    # Request a large page so rerunning the script doesn't
    # accidentally duplicate products because of pagination.
    response = requests.get(
        f"{BASE_URL}/products",
        params={"page": 1, "limit": 1000},
        timeout=20,
    )

    if response.status_code != 200:
        print(
            f"WARNING: Could not fetch existing products."
            f" HTTP {response.status_code}"
        )
        print("Continuing with an empty duplicate set.")
        return set()

    data = response.json()

    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        items = data.get("items", data.get("products", data.get("data", [])))
    else:
        items = []

    slugs = {
        item.get("slug")
        for item in items
        if item.get("slug")
    }

    print(f"Found {len(slugs)} existing product slugs.")

    return slugs


# ============================================================
# CREATE PRODUCT
# ============================================================

def create_product(product, category_map, size_map):

    category_id = category_map[product["category"]]

    size_ids = []

    for size_name in product["sizes"]:
        if size_name not in size_map:
            print(
                f"  [!] Missing size '{size_name}'"
                f" for {product['name']}"
            )
            return False

        size_ids.append(size_map[size_name])

    fit, gender, color, material, pattern, season, occasion, style = product["meta"]

    payload = {
        "name": product["name"],
        "slug": product["slug"],
        "description": product["description"],
        "price": product["price"],
        "discount_price": product["discount_price"],
        "quantity": product["quantity"],
        "brand": product["brand"],
        "category_id": category_id,
        "image_url": "",
        "sizes": size_ids,
        "product_metadata": {
            "fit_type": fit,
            "gender_target": gender,
            "color": color,
            "material": material,
            "pattern": pattern,
            "season": season,
            "occasion": occasion,
            "style": style,
        },
    }

    response = requests.post(
        f"{BASE_URL}/products",
        headers=HEADERS,
        json=payload,
        timeout=20,
    )

    if response.status_code in (200, 201):
        print(
            f"  [+] {product['name']}"
            f" | ₹{product['discount_price']}"
            f" | Stock {product['quantity']}"
        )
        return True

    print(
        f"  [!] FAILED: {product['name']}"
        f" | HTTP {response.status_code}"
    )
    print(f"      {response.text}")

    return False


# ============================================================
# MAIN
# ============================================================

def main():

    if TOKEN == "PASTE_YOUR_ADMIN_JWT_HERE":
        print("ERROR: Put your admin JWT into TOKEN first.")
        sys.exit(1)

    print("=" * 70)
    print("WearIT — Production Catalog Seeder")
    print("=" * 70)

    validate_catalog()

    # 1. Ensure Size master exists
    size_map = ensure_sizes()

    print("\nSize map:")
    for name, size_id in size_map.items():
        print(f"  {name:>3} -> {size_id}")

    # 2. Resolve categories
    category_map = get_categories()

    required_categories = {
        p["category"]
        for p in PRODUCTS
    }

    missing = required_categories - set(category_map)

    if missing:
        print("\nERROR: Missing categories:")
        for category in sorted(missing):
            print(f"  - {category}")
        sys.exit(1)

    # 3. Check duplicates
    existing_slugs = get_existing_products()

    # 4. Create products
    print("\nCreating products...\n")

    created = 0
    skipped = 0
    failed = 0

    for product in PRODUCTS:

        if product["slug"] in existing_slugs:
            print(
                f"  [-] Skipped: {product['name']}"
                f" -> already exists"
            )
            skipped += 1
            continue

        if create_product(product, category_map, size_map):
            created += 1
            existing_slugs.add(product["slug"])
        else:
            failed += 1

    print("\n" + "=" * 70)
    print("WearIT Product Seeding Complete")
    print("=" * 70)
    print(f"Total products : {len(PRODUCTS)}")
    print(f"Created        : {created}")
    print(f"Skipped        : {skipped}")
    print(f"Failed         : {failed}")
    print("=" * 70)


if __name__ == "__main__":
    main()