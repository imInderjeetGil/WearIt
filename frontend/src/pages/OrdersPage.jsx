// src/pages/OrdersPage.jsx

import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { getOrders } from "../api/order";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const { data } = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

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
    <section className="mx-auto max-w-6xl px-4 py-12">

      <h1 className="mb-10 text-4xl font-black">
        My Orders
      </h1>

      <div className="space-y-8">

        {orders.map((order) => (

          <div
            key={order.id}
            className="rounded-2xl border p-6"
          >

            <div className="flex items-center justify-between">

              <div>

                <h2 className="font-bold">
                  Order #{order.id}
                </h2>

                <p className="text-sm text-zinc-500">
                  {new Date(
                    order.created_at
                  ).toLocaleDateString()}
                </p>

              </div>

              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">

                {order.status}

              </span>

            </div>

            <div className="mt-6 space-y-4">

              {order.items.map((item) => (

                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >

                  <div>

                    <p className="font-medium">
                      Product #{item.product_id}
                    </p>

                    <p className="text-sm text-zinc-500">
                      Qty : {item.quantity}
                    </p>

                  </div>

                  <p className="font-semibold">
                    ₹{item.price}
                  </p>

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