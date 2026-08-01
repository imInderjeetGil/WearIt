// src/pages/OrdersPage.jsx

import { useCallback, useEffect, useState } from "react";
import { Package } from "lucide-react";
import { getOrders } from "../api/order";
import { Link } from "react-router-dom";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Loading...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center">

        <Package
          size={70}
          className="text-zinc-300"
        />

        <h2 className="mt-6 text-3xl font-bold">
          No Orders Yet
        </h2>

        <p className="mt-2 text-zinc-500">
          Your purchased products will appear here.
        </p>

      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:py-12">

      <h1 className="mb-6 sm:mb-10 text-2xl sm:text-4xl font-black">
        My Orders
      </h1>

      <div className="space-y-6 sm:space-y-8">

        {orders.map((order) => (

          <div
            key={order.id}
            className="rounded-2xl border p-4 sm:p-6"
          >

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div>

                <h2 className="font-bold text-base sm:text-lg">
                  Order #{order.id}
                </h2>

                <p className="text-xs sm:text-sm text-zinc-500">
                  {new Date(
                    order.created_at
                  ).toLocaleDateString()}
                </p>

              </div>

              <span
  className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium ${
    statusStyles[order.status] ??
    "bg-zinc-100 text-zinc-700"
  }`}
>
  {order.status}
</span>

            </div>

            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">

              {order.items.map((item) => (

  <div
    key={item.id}
    className="flex flex-col sm:flex-row gap-3 sm:gap-4 rounded-xl border p-3.5 sm:p-4"
  >

    <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
      <Link to={`/products/${item.product.id}`} className="shrink-0">

        <img
          src={item.product.image_url}
          alt={item.product.name}
          className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover"
        />

      </Link>

      <div className="flex-1 min-w-0">

        <Link
          to={`/products/${item.product.id}`}
          className="hover:underline"
        >

          <h3 className="font-semibold text-sm sm:text-base break-words">
            {item.product.name}
          </h3>

        </Link>

        <div className="mt-1.5 flex flex-wrap gap-2">

          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium">
            Size {item.size?.name}
          </span>

        </div>

        <p className="mt-2 text-xs sm:text-sm text-zinc-500">
          Qty: {item.quantity}
        </p>

      </div>
    </div>

    <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 flex sm:flex-col justify-between sm:justify-start">

      <p className="font-semibold text-sm sm:text-base">
        ₹{item.price}
      </p>

      <p className="text-xs sm:text-sm text-zinc-500">
        Total ₹{item.price * item.quantity}
      </p>

    </div>

  </div>

))}

            </div>

            <hr className="my-6" />

            <div className="flex justify-between text-lg font-bold">

              <span>Total</span>

              <span>
                ₹{order.total_amount}
              </span>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}
