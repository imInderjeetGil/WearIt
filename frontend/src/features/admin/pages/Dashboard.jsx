import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Package,
  ShoppingCart,
  IndianRupee,
  TriangleAlert,
} from "lucide-react";

import { getProducts } from "../../catalog/api/products";
import { getAllOrders } from "../../orders/api/orders";

import DashboardHeader from "../components/DashboardHeader";
import StatCard from "../components/StatCard";
import SectionCard from "../components/SectionCard";
import RecentOrderCard from "../components/RecentOrderCard";
import InventoryAlert from "../components/InventoryAlert";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const [{ data: productsData }, { data: ordersData }] =
        await Promise.all([
          getProducts({ limit: 100 }),
          getAllOrders(),
        ]);

      setProducts(
        Array.isArray(productsData)
          ? productsData
          : productsData.products || []
      );

      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const revenue = useMemo(
    () =>
      orders.reduce(
        (sum, order) => sum + order.total_amount,
        0
      ),
    [orders]
  );

  const pendingOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "pending"
      ),
    [orders]
  );

  const lowStockProducts = useMemo(
    () =>
      products.filter((p) => p.quantity <= 5),
    [products]
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        )
        .slice(0, 5),
    [orders]
  );

  return (
    <>
      <DashboardHeader />

      <div className="grid gap-6 grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Products"
          value={products.length}
          subtitle="Active Products"
          icon={Package}
        />

        <StatCard
          title="Orders"
          value={orders.length}
          subtitle={`${pendingOrders.length} Pending`}
          icon={ShoppingCart}
        />

        <StatCard
          title="Revenue"
          value={`₹${revenue.toLocaleString()}`}
          subtitle="Total Revenue"
          icon={IndianRupee}
        />

        <StatCard
          title="Low Stock"
          value={lowStockProducts.length}
          subtitle="Need Attention"
          icon={TriangleAlert}
        />

      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">

        <SectionCard title="Recent Orders">

          {loading ? (

            <p className="text-zinc-500">
              Loading...
            </p>

          ) : recentOrders.length ? (

            recentOrders.map((order) => (
              <RecentOrderCard
                key={order.id}
                order={order}
              />
            ))

          ) : (

            <p className="text-zinc-500">
              No orders yet.
            </p>

          )}

        </SectionCard>

        <SectionCard title="Inventory Alerts">

          {lowStockProducts.length ? (

            lowStockProducts.map((product) => (
              <InventoryAlert
                key={product.id}
                product={product}
              />
            ))

          ) : (

            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">

              <h3 className="font-semibold text-green-700">
                Inventory Healthy ✅
              </h3>

              <p className="mt-2 text-sm text-green-600">
                No products require restocking.
              </p>

            </div>

          )}

        </SectionCard>

      </div>
    </>
  );
}