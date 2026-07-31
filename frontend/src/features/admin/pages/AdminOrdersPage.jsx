import { useCallback, useEffect, useState } from "react";
import { Loader2, Truck, Package, CheckCircle2, Clock, AlertCircle, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";

import { getAllOrders, getOrderItems, updateOrderStatus } from "../../orders/api/orders";

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Package },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

const statusFlow = ["pending", "processing", "shipped", "delivered"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await getAllOrders();
      const ordersWithItems = await Promise.all(
        data.map(async (order) => {
          const { data: items } = await getOrderItems(order.id);
          return { ...order, items };
        })
      );
      setOrders(ordersWithItems);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  async function handleStatusChange(orderId, newStatus) {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order marked as ${statusConfig[newStatus].label}`);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  function getNextStatus(current) {
    const idx = statusFlow.indexOf(current);
    if (idx === -1 || idx === statusFlow.length - 1) return null;
    return statusFlow[idx + 1];
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Admin</p>
          <h1 className="mt-2 text-4xl font-black">Orders</h1>
        </div>
        <div className="rounded-2xl border bg-white p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-zinc-200 rounded w-1/4" />
            <div className="h-12 bg-zinc-200 rounded w-1/4" />
            <div className="h-12 bg-zinc-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Admin</p>
        <h1 className="mt-2 text-4xl font-black">Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border bg-white p-12 text-center">
          <p className="text-zinc-500">No orders yet</p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-white overflow-hidden divide-y divide-zinc-100">
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const ConfigIcon = config.icon;
            const nextStatus = getNextStatus(order.status);
            const isExpanded = expandedOrder === order.id;

            return (
              <div key={order.id} className="bg-white">
                <div
                  onClick={() =>
                    setExpandedOrder(isExpanded ? null : order.id)
                  }
                  className="p-4 hover:bg-zinc-50 cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex-1 flex items-center gap-4 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 font-mono text-sm">#{order.id}</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
                      >
                        <ConfigIcon size={12} className="mr-1" />
                        {config.label}
                      </span>
                    </div>
                    <div className="hidden sm:block text-zinc-500 text-sm">
                      {order.user?.name || "Customer"} &middot;₹{order.total_amount}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-zinc-500 text-sm whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span
                      className={`transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      } text-zinc-400`}
                    >
                      <ChevronDown size={20} />
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t divide-zinc-100">
                    <div className="pt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500 uppercase tracking-wide">Total</p>
                        <p className="font-semibold text-lg">₹{order.total_amount}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500 uppercase tracking-wide">Items</p>
                        <p className="font-semibold">{order.items?.length || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500 uppercase tracking-wide">Date</p>
                        <p className="font-semibold">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500 uppercase tracking-wide">Status</p>
                        <p className="font-semibold capitalize">{order.status}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-zinc-50 p-4">
                      <h4 className="font-semibold mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-2 bg-white rounded-lg"
                          >
                            {item.product?.image_url && (
                              <img
                                src={item.product.image_url}
                                alt={item.product?.name || ""}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {item.product?.name || "Unknown Product"}
                              </p>
                              <p className="text-sm text-zinc-500">
                                Qty: {item.quantity} &times; ₹{item.price}
                              </p>
                            </div>
                            <span className="font-semibold text-zinc-900">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {nextStatus && (
                      <div className="mt-4 pt-4 border-t flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleStatusChange(order.id, nextStatus)}
                          disabled={updatingId === order.id}
                          className="px-4 py-2 rounded-lg bg-black text-white font-medium hover:bg-zinc-800 transition disabled:opacity-50"
                        >
                          {updatingId === order.id ? (
                            <>
                              <Loader2 size={16} className="animate-spin mr-2" />
                              Updating...
                            </>
                          ) : (
                            `Mark as ${statusConfig[nextStatus].label}`
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}