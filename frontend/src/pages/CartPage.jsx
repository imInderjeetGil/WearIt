// src/pages/CartPage.jsx

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";

import useCartStore from "../store/cartStore";

export default function CartPage() {
  const {
    items,
    loading,
    fetchCart,
    removeItem,
    subtotal,
  } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Loading...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-6">
        <ShoppingBag
          size={70}
          className="text-zinc-300"
        />

        <h2 className="mt-6 text-3xl font-bold">
          Your cart is empty
        </h2>

        <p className="mt-3 text-zinc-500">
          Looks like you haven't added anything yet.
        </p>

        <Link
          to="/products"
          className="mt-8 rounded-xl bg-black px-8 py-3 font-medium text-white"
        >
          Continue Shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">

      <h1 className="mb-10 text-4xl font-black">
        Shopping Cart
      </h1>

      <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">

        {/* Cart Items */}

        <div className="space-y-6">

          {items.map((item) => (

            <div
              key={item.id}
              className="flex gap-5 rounded-2xl border p-5"
            >

              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="h-32 w-24 rounded-xl object-cover"
              />

              <div className="flex flex-1 flex-col justify-between">

                <div>

                  <h3 className="text-xl font-semibold">
                    {item.product.name}
                  </h3>

                  <p className="mt-2 text-zinc-500">
                    ₹{item.product.price}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Qty : {item.quantity}
                  </p>

                </div>

                <button
                  onClick={() =>
                    removeItem(item.id)
                  }
                  className="mt-5 flex w-fit items-center gap-2 text-red-500"
                >
                  <Trash2 size={18} />

                  Remove
                </button>

              </div>

            </div>

          ))}

        </div>

        {/* Summary */}

        <div className="h-fit rounded-2xl border p-6">

          <h2 className="text-2xl font-bold">
            Order Summary
          </h2>

          <div className="mt-8 flex justify-between">

            <span>Subtotal</span>

            <span>
              ₹{subtotal()}
            </span>

          </div>

          <div className="mt-4 flex justify-between">

            <span>Shipping</span>

            <span>Free</span>

          </div>

          <hr className="my-6" />

          <div className="flex justify-between text-xl font-bold">

            <span>Total</span>

            <span>
              ₹{subtotal()}
            </span>

          </div>

          <Link
            to="/checkout"
            className="mt-8 flex h-14 items-center justify-center rounded-xl bg-black font-semibold text-white"
          >
            Proceed to Checkout
          </Link>

        </div>

      </div>

    </section>
  );
}