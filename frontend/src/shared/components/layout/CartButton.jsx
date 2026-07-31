import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

import useCartStore from "../../../features/cart/store/cart-store";
import { useAuth } from "../../../features/auth/context/auth-context";

export default function CartButton() {
  const {
    totalItems,
    fetchCart,
  } = useCartStore();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      void fetchCart().catch(() => undefined);
    }
  }, [fetchCart, isAuthenticated]);

  const cartCount = isAuthenticated ? totalItems() : 0;

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
