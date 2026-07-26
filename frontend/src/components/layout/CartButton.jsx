import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

import useCartStore from "../../store/cartStore";

export default function CartButton() {
  const {
    totalItems,
    fetchCart,
  } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const cartCount = totalItems();

  return (
    <Link
      to="/cart"
      className="
        relative
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-full
        transition
        hover:bg-zinc-100
      "
    >
      <ShoppingBag size={22} />

      {cartCount > 0 && (
        <span
          className="
            absolute
            -right-1
            -top-1
            flex
            h-5
            w-5
            items-center
            justify-center
            rounded-full
            bg-black
            text-[11px]
            font-medium
            text-white
          "
        >
          {cartCount}
        </span>
      )}
    </Link>
  );
}