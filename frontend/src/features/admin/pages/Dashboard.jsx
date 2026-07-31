import { useCallback, useEffect, useState } from "react";
import { Package, ShoppingCart, Shapes, IndianRupee } from "lucide-react";

import { getProducts } from "../../catalog/api/products";
import { getCategories } from "../../catalog/api/categories";
import { getAllOrders } from "../../orders/api/orders";

export default function Dashboard() {
  const [stats, setStats] = useState([
    { title: "Products", value: 0, icon: Package },
    { title: "Orders", value: 0, icon: ShoppingCart },
    { title: "Categories", value: 0, icon: Shapes },
    { title: "Revenue", value: "₹0", icon: IndianRupee },
  ]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [{ data: products }, { data: categories }, { data: orders }] = await Promise.all([
        getProducts({ limit: 100 }),
        getCategories(),
        getAllOrders(),
      ]);
      
      const productList = Array.isArray(products) ? products : products.products || products.items || products.data || [];
      const categoryList = Array.isArray(categories) ? categories : [];
      const orderList = Array.isArray(orders) ? orders : [];

      setStats([
        { title: "Products", value: productList.length, icon: Package },
        { title: "Orders", value: orderList.length, icon: ShoppingCart },
        { title: "Categories", value: categoryList.length, icon: Shapes },
        { title: "Revenue", value: orderList.reduce((sum, o) => sum + o.total_amount, 0), icon: IndianRupee },
      ]);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return (
    <>
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Admin</p>
        <h1 className="mt-2 text-4xl font-black">Dashboard</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const displayValue = stat.title === "Revenue" 
            ? `₹${stat.value.toLocaleString()}` 
            : stat.value;
          
          return (
            <div
              key={stat.title}
              className={`
                rounded-2xl border bg-white p-6 shadow-sm transition
                ${loading ? "animate-pulse" : ""}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">{stat.title}</p>
                  <h2 className="mt-3 text-4xl font-black">{displayValue}</h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
                  <Icon size={26} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a href="/admin/products/new" className="p-4 rounded-xl border hover:bg-zinc-50 transition text-left">
              <p className="font-semibold">Add Product</p>
              <p className="text-sm text-zinc-500 mt-1">Create a new product listing</p>
            </a>
            <a href="/admin/categories" className="p-4 rounded-xl border hover:bg-zinc-50 transition text-left">
              <p className="font-semibold">Manage Categories</p>
              <p className="text-sm text-zinc-500 mt-1">Add or edit categories</p>
            </a>
            <a href="/admin/orders" className="p-4 rounded-xl border hover:bg-zinc-50 transition text-left">
              <p className="font-semibold">View Orders</p>
              <p className="text-sm text-zinc-500 mt-1">Manage customer orders</p>
            </a>
            <a href="/admin/products" className="p-4 rounded-xl border hover:bg-zinc-50 transition text-left">
              <p className="font-semibold">All Products</p>
              <p className="text-sm text-zinc-500 mt-1">View and manage inventory</p>
            </a>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <p className="mt-4 text-zinc-500">Recent orders will appear here once customers start ordering.</p>
        </div>
      </div>
    </>
  );
}