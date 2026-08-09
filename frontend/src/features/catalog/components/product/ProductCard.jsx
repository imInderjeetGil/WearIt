import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getWishlistIds, toggleWishlist } from "../../../wishlist/api/wishlist";

export default function ProductCard({ product }) {
  const hasDiscount =
    product.discount_price &&
    product.discount_price < product.price;
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    async function load() {
        try {
            const { data } =
                await getWishlistIds();
            setWishlisted(
                data.includes(product.id)
            );
        }
        catch {}
    }
    load();
}, [product.id]);

async function handleWishlist(e) {

    e.preventDefault();

    e.stopPropagation();

    const previous = wishlisted;

    setWishlisted(!previous);

    try {

        const { data } =
            await toggleWishlist(product.id);

        setWishlisted(
            data.wishlisted
        );

    }

    catch (err) {
  console.log(err);
  console.log(err.response);
  console.log(err.response?.data);

  setWishlisted(previous);

  toast.error("Something went wrong");
}

}
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
          onClick={handleWishlist}
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

fill={
    wishlisted
        ? "currentColor"
        : "none"
}

className={
    wishlisted
        ? "text-red-500"
        : "text-zinc-500"
}

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

      <div className="pt-3 sm:pt-4">

        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-400 truncate">
          {product.brand}
        </p>

        <h3
          className="
            mt-1 sm:mt-2
            line-clamp-2
            min-h-[2.25rem] sm:min-h-[2.5rem]
            text-xs sm:text-[15px]
            font-medium
            leading-snug sm:leading-6
            transition
            group-hover:text-black
          "
        >
          {product.name}
        </h3>

        <div className="mt-2 flex flex-wrap items-baseline gap-1.5 sm:gap-2.5">

          <span className="text-sm sm:text-lg font-bold">
            ₹
            {product.discount_price ?? product.price}
          </span>

          {hasDiscount && (
            <span className="text-xs sm:text-sm text-zinc-400 line-through">
              ₹{product.price}
            </span>
          )}

        </div>

      </div>
    </Link>
  );
}