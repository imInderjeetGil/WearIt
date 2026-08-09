// src/pages/OrderSuccess.jsx

import { CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function OrderSuccess() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <section className="flex min-h-[80vh] items-center justify-center px-4">

      <div className="w-full max-w-xl rounded-3xl border p-10 text-center">

        <CheckCircle2
          size={90}
          className="mx-auto text-green-500"
        />

        <h1 className="mt-8 text-4xl font-black">
          Order Placed!
        </h1>

        <p className="mt-4 text-zinc-500 leading-7">
          Thank you for shopping with WearIt.
          <br />
          {orderId ? (
            <>
              Order <span className="font-semibold text-black">#{orderId}</span>{" "}
              has been paid successfully.
            </>
          ) : (
            "Your order has been placed successfully."
          )}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">

          <Link
            to="/products"
            className="
              flex-1
              rounded-xl
              border
              py-4
              text-center
              font-semibold
              transition
              hover:bg-zinc-100
            "
          >
            Continue Shopping
          </Link>

          <Link
            to="/orders"
            className="
              flex-1
              rounded-xl
              bg-black
              py-4
              text-center
              font-semibold
              text-white
              transition
              hover:bg-zinc-800
            "
          >
            View Orders
          </Link>

        </div>

      </div>

    </section>
  );
}