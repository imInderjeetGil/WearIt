import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const hasDiscount =
    product.discount_price &&
    product.discount_price < product.price;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block"
    >
      {/* Image */}

      <div className="relative overflow-hidden rounded-2xl bg-zinc-100 aspect-[3/4]">

        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="
            h-full
            w-full
            object-cover
            duration-500
            group-hover:scale-105
          "
        />

        {/* Wishlist */}

        <button
          onClick={(e) => e.preventDefault()}
          className="
            absolute
            right-3
            top-3
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-white/90
            shadow-sm
            transition
            hover:bg-white
          "
        >
          <Heart
            size={18}
            className="text-zinc-700"
          />
        </button>

        {/* Discount */}

        {hasDiscount && (
          <div
            className="
              absolute
              left-3
              top-3
              rounded-full
              bg-black
              px-3
              py-1
              text-xs
              font-semibold
              text-white
            "
          >
            SALE
          </div>
        )}

      </div>

      {/* Details */}

      <div className="pt-4">

        <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
          {product.brand}
        </p>

        <h3
          className="
            mt-2
            line-clamp-2
            min-h-48px
            text-[15px]
            font-medium
            leading-6
            transition
            group-hover:text-black
          "
        >
          {product.name}
        </h3>

        <div className="mt-3 flex items-center gap-3">

          <span className="text-lg font-bold">
            ₹
            {product.discount_price ?? product.price}
          </span>

          {hasDiscount && (
            <span className="text-sm text-zinc-400 line-through">
              ₹{product.price}
            </span>
          )}

        </div>

      </div>
    </Link>
  );
}