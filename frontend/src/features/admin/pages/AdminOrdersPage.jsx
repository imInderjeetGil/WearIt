import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Loader2,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  Search,
  X,
  Filter,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  rejectCancellation,
} from "../../orders/api/orders";

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Package },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

const paymentConfig = {
  pending: { label: "Payment Pending", color: "bg-zinc-100 text-zinc-600", icon: Clock },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  cancelled: { label: "Payment Cancelled", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

const statusFlow = ["pending", "processing", "shipped", "delivered"];

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "cancelled"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "amount_desc", label: "Amount: High to Low" },
  { value: "amount_asc", label: "Amount: Low to High" },
];

const PAGE_SIZE = 20;

const summaryCardColors = {
  total: "text-zinc-900",
  pending: "text-yellow-600",
  processing: "text-blue-600",
  shipped: "text-purple-600",
  delivered: "text-green-600",
  cancelled: "text-red-600",
};

export default function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const payment_status = searchParams.get("payment_status") || "";
  const date_from = searchParams.get("date_from") || "";
  const date_to = searchParams.get("date_to") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchSeq = useRef(0);

  const hasFilters =
    search || status || payment_status || date_from || date_to || sort !== "newest";

  function updateParams(patch, { resetPage = true, replace = false } = {}) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === "" || value === null || value === undefined || value === "newest") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    if (resetPage) next.delete("page");
    setSearchParams(next, { replace });
  }

  function clearFilters() {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  }

  // Sync the local search box when the URL search changes (e.g. Clear Filters).
  useEffect(() => {
    setSearchInput(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Debounce the search box into the URL.
  useEffect(() => {
    if (searchInput === search) return;
    const timer = setTimeout(() => {
      updateParams({ search: searchInput }, { resetPage: true, replace: true });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const fetchOrders = useCallback(async () => {
    const seq = ++fetchSeq.current;
    setLoading(true);
    setError(false);

    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (payment_status) params.payment_status = payment_status;
      if (date_from) params.date_from = date_from;
      if (date_to) params.date_to = date_to;
      if (sort && sort !== "newest") params.sort = sort;
      params.page = page;
      params.limit = PAGE_SIZE;

      const { data } = await getAllOrders(params);

      if (seq !== fetchSeq.current) return; // stale response

      setOrders(data.items || []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setSummary(data.summary || null);
    } catch {
      if (seq === fetchSeq.current) setError(true);
    } finally {
      if (seq === fetchSeq.current) setLoading(false);
    }
  }, [search, status, payment_status, date_from, date_to, sort, page]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  async function handleStatusChange(orderId, newStatus) {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order marked as ${statusConfig[newStatus].label}`);
      void fetchOrders();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleCancel(orderId) {
    if (!window.confirm("Cancel this order? Stock will be returned.")) return;

    try {
      setUpdatingId(orderId);
      await cancelOrder(orderId);
      toast.success("Order cancelled");
      void fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.detail ?? "Failed to cancel order");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleReject(orderId) {
    if (
      !window.confirm(
        "Reject this cancellation request? The order will continue as normal."
      )
    )
      return;

    try {
      setUpdatingId(orderId);
      await rejectCancellation(orderId);
      toast.success("Cancellation request rejected");
      void fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.detail ?? "Failed to reject request");
    } finally {
      setUpdatingId(null);
    }
  }

  function getNextStatus(current) {
    const idx = statusFlow.indexOf(current);
    if (idx === -1 || idx === statusFlow.length - 1) return null;
    return statusFlow[idx + 1];
  }

  const visibleOrders = orders;
  const visibleTotal = total;
  const visiblePages = pages;

  // Auto-clamp page when results shrink below the current page.
  useEffect(() => {
    if (!loading && !error && page > visiblePages) {
      updateParams({ page: String(visiblePages) }, { resetPage: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visiblePages, page, loading, error]);

  function toggleStatus(key) {
    updateParams({ status: status === key ? "" : key });
  }

  const summaryCards = [
    { key: "total", label: "Total", count: summary?.total ?? 0 },
    ...ORDER_STATUSES.map((key) => ({
      key,
      label: statusConfig[key]?.label || key,
      count: summary?.[key] ?? 0,
    })),
  ];

  function buildPages(current, totalPages) {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const out = [1];
    if (current > 3) out.push("…");
    for (let p = Math.max(2, current - 1); p <= Math.min(totalPages - 1, current + 1); p++) {
      out.push(p);
    }
    if (current < totalPages - 2) out.push("…");
    out.push(totalPages);
    return out;
  }

  const startIdx = visibleTotal === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(startIdx + PAGE_SIZE - 1, visibleTotal);

  // --- Shared render helpers -------------------------------------------------

  function renderExpandedDetail(order) {
    const payConfig = paymentConfig[order.payment_status] || paymentConfig.pending;
    const PayIcon = payConfig.icon;
    const nextStatus = getNextStatus(order.status);
    const showActions =
      nextStatus ||
      order.cancel_requested ||
      order.status === "pending" ||
      order.status === "processing";

    return (
      <div className="border-t">
        <div className="pt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Payment</p>
            <p
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${payConfig.color}`}
            >
              <PayIcon size={12} />
              {payConfig.label}
            </p>
          </div>
        </div>

        {order.address && (
          <div className="mt-4 rounded-xl bg-zinc-50 p-4">
            <h4 className="font-semibold mb-3">Shipping Address</h4>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.full_name}</p>
              <p className="text-zinc-600">
                {order.address}, {order.city} - {order.pincode}
              </p>
              <p className="text-zinc-600">Phone: {order.phone}</p>
            </div>
          </div>
        )}

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
                    Size: <span className="font-medium">{item.size?.name}</span>
                  </p>
                  <p className="text-sm text-zinc-500">
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <span className="font-semibold text-zinc-900">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {showActions && (
          <div className="mt-4 pt-4 border-t flex flex-wrap items-center justify-end gap-3">
            {order.cancel_requested ? (
              <>
                <button
                  onClick={() => handleReject(order.id)}
                  disabled={updatingId === order.id}
                  className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-600 font-medium hover:bg-zinc-50 transition disabled:opacity-50"
                >
                  Reject Request
                </button>
                <button
                  onClick={() => handleCancel(order.id)}
                  disabled={updatingId === order.id}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50"
                >
                  Approve Cancellation
                </button>
              </>
            ) : (
              (order.status === "pending" || order.status === "processing") && (
                <button
                  onClick={() => handleCancel(order.id)}
                  disabled={updatingId === order.id}
                  className="px-4 py-2 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition disabled:opacity-50"
                >
                  Cancel Order
                </button>
              )
            )}
            {nextStatus && (
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
            )}
          </div>
        )}
      </div>
    );
  }

  function renderStatusBadge(order) {
    const config = statusConfig[order.status] || statusConfig.pending;
    const ConfigIcon = config.icon;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <ConfigIcon size={12} className="mr-1" />
        {config.label}
      </span>
    );
  }

  function renderPaymentBadge(order) {
    const payConfig = paymentConfig[order.payment_status] || paymentConfig.pending;
    const PayIcon = payConfig.icon;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payConfig.color}`}
      >
        <PayIcon size={12} className="mr-1" />
        {payConfig.label}
      </span>
    );
  }

  // --- Loading skeleton ------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Admin</p>
          <h1 className="mt-2 text-4xl font-black">Orders</h1>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border bg-white p-4">
              <div className="h-3 w-16 bg-zinc-200 rounded" />
              <div className="mt-3 h-6 w-12 bg-zinc-200 rounded" />
            </div>
          ))}
        </div>

        <div className="animate-pulse rounded-2xl border bg-white p-4">
          <div className="flex flex-wrap gap-3">
            <div className="h-10 w-full sm:w-56 bg-zinc-200 rounded-lg" />
            <div className="h-10 w-40 bg-zinc-200 rounded-lg" />
            <div className="h-10 w-40 bg-zinc-200 rounded-lg" />
          </div>
        </div>

        <div className="animate-pulse rounded-2xl border bg-white overflow-hidden">
          <div className="hidden lg:flex gap-6 px-4 py-3 bg-zinc-50">
            {[30, 40, 20, 25, 25, 20, 5].map((w, i) => (
              <div key={i} className="h-4 bg-zinc-200 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-6 px-4 py-4 border-t border-zinc-100">
              <div className="h-4 w-12 bg-zinc-100 rounded" />
              <div className="h-4 w-40 bg-zinc-100 rounded" />
              <div className="h-4 w-16 bg-zinc-100 rounded" />
              <div className="h-6 w-20 bg-zinc-100 rounded-full" />
              <div className="h-6 w-20 bg-zinc-100 rounded-full" />
              <div className="h-4 w-24 bg-zinc-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Error state -----------------------------------------------------------

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Admin</p>
          <h1 className="mt-2 text-4xl font-black">Orders</h1>
        </div>
        <div className="rounded-2xl border bg-white p-12 text-center">
          <AlertCircle className="mx-auto text-red-400" size={40} />
          <h3 className="mt-4 font-semibold text-zinc-900">Failed to load orders</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Something went wrong while fetching orders.
          </p>
          <button
            onClick={() => void fetchOrders()}
            className="mt-4 px-4 py-2 rounded-lg bg-black text-white font-medium hover:bg-zinc-800 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- Empty states ----------------------------------------------------------

  if (visibleTotal === 0) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Admin</p>
          <h1 className="mt-2 text-4xl font-black">Orders</h1>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {summaryCards.map((card) => (
            <div key={card.key} className="rounded-2xl border bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">{card.label}</p>
              <p className={`mt-1 text-2xl font-black ${summaryCardColors[card.key]}`}>
                {card.count}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-white p-12 text-center">
          {hasFilters ? (
            <>
              <Filter className="mx-auto text-zinc-300" size={40} />
              <h3 className="mt-4 font-semibold text-zinc-900">
                No orders match your filters
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Try adjusting the search or clearing the filters.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 rounded-lg bg-black text-white font-medium hover:bg-zinc-800 transition"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <Package className="mx-auto text-zinc-300" size={40} />
              <h3 className="mt-4 font-semibold text-zinc-900">No orders yet</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Orders will appear here once customers start checking out.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // --- Main view -------------------------------------------------------------

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Admin</p>
        <h1 className="mt-2 text-4xl font-black">Orders</h1>
      </div>

      {/* Summary / status overview cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <button
            key={card.key}
            onClick={() =>
              card.key === "total"
                ? updateParams({ status: "" })
                : toggleStatus(card.key)
            }
            className={`rounded-2xl border bg-white p-4 text-left transition ${
              status === card.key
                ? "border-zinc-900 ring-2 ring-zinc-900"
                : "hover:border-zinc-300"
            }`}
          >
            <p className="text-xs uppercase tracking-wide text-zinc-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-black ${summaryCardColors[card.key]}`}>
              {card.count}
            </p>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 items-end">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search orders"
            className="w-full h-10 pl-9 pr-8 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={status}
          onChange={(e) => updateParams({ status: e.target.value })}
          className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusConfig[s]?.label || s}
            </option>
          ))}
        </select>

        <select
          value={payment_status}
          onChange={(e) => updateParams({ payment_status: e.target.value })}
          className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">All Payments</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {paymentConfig[s]?.label || s}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date_from}
            onChange={(e) => updateParams({ date_from: e.target.value })}
            className="h-10 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            aria-label="Date from"
          />
          <span className="text-zinc-400">–</span>
          <input
            type="date"
            value={date_to}
            onChange={(e) => updateParams({ date_to: e.target.value })}
            className="h-10 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            aria-label="Date to"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex h-10 items-center justify-center gap-1 rounded-lg border border-zinc-300 bg-white text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition"
          >
            <Filter size={14} />
            Clear Filters
          </button>
        )}
      </div>

      {/* Orders list */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        {/* Mobile card view */}
        <div className="lg:hidden divide-y divide-zinc-100">
          {visibleOrders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            return (
              <div key={order.id} className="bg-white">
                <div
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="p-4 cursor-pointer hover:bg-zinc-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-zinc-500 font-mono text-sm">#{order.id}</span>
                      {order.cancel_requested && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Cancel Requested
                        </span>
                      )}
                    </div>
                    <span className="text-zinc-500 text-sm whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm text-zinc-600 truncate">
                    {order.customer_name || order.user?.name || order.full_name || "Customer"}
                    {order.customer_email || order.user?.email
                      ? ` · ${order.customer_email || order.user?.email}`
                      : ""}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {renderStatusBadge(order)}
                    {renderPaymentBadge(order)}
                    <span className="ml-auto font-bold">₹{order.total_amount}</span>
                    <ChevronDown
                      size={20}
                      className={`text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4">{renderExpandedDetail(order)}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop table view */}
        <div className="hidden lg:block">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr>
                <th className="p-4 text-left font-semibold text-zinc-600">Order</th>
                <th className="p-4 text-left font-semibold text-zinc-600">Customer</th>
                <th className="p-4 text-left font-semibold text-zinc-600">Amount</th>
                <th className="p-4 text-left font-semibold text-zinc-600">Status</th>
                <th className="p-4 text-left font-semibold text-zinc-600">Payment</th>
                <th className="p-4 text-left font-semibold text-zinc-600">Date</th>
                <th className="p-4 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {visibleOrders.map((order) => {
                const isExpanded = expandedOrder === order.id;
                return (
                  <FragmentRow
                    key={order.id}
                    order={order}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedOrder(isExpanded ? null : order.id)}
                    renderStatusBadge={renderStatusBadge}
                    renderPaymentBadge={renderPaymentBadge}
                    renderExpandedDetail={renderExpandedDetail}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3">
        <p className="text-sm text-zinc-500">
          Showing {startIdx}–{endIdx} of {visibleTotal} order{visibleTotal === 1 ? "" : "s"}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-1">
          <button
            onClick={() => updateParams({ page: String(page - 1) }, { resetPage: false })}
            disabled={page <= 1}
            className="h-9 px-3 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>

          {buildPages(page, visiblePages).map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="px-1.5 text-zinc-400">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => updateParams({ page: String(p) }, { resetPage: false })}
                className={`h-9 min-w-9 px-3 rounded-lg text-sm font-medium transition ${
                  p === page
                    ? "bg-black text-white"
                    : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => updateParams({ page: String(page + 1) }, { resetPage: false })}
            disabled={page >= visiblePages}
            className="h-9 px-3 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// Desktop table row with an expandable detail row. Kept as a small component so
// the tbody rows are valid table children.
function FragmentRow({
  order,
  isExpanded,
  onToggle,
  renderStatusBadge,
  renderPaymentBadge,
  renderExpandedDetail,
}) {
  return (
    <>
      <tr onClick={onToggle} className="hover:bg-zinc-50 cursor-pointer">
        <td className="p-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-700">#{order.id}</span>
            {order.cancel_requested && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Cancel Requested
              </span>
            )}
          </div>
        </td>
        <td className="p-4">
          <p className="font-medium">
            {order.customer_name || order.user?.name || order.full_name || "Customer"}
          </p>
          {(order.customer_email || order.user?.email) && (
            <p className="text-sm text-zinc-500">{order.customer_email || order.user?.email}</p>
          )}
        </td>
        <td className="p-4 font-semibold">₹{order.total_amount}</td>
        <td className="p-4">{renderStatusBadge(order)}</td>
        <td className="p-4">{renderPaymentBadge(order)}</td>
        <td className="p-4 text-zinc-500 text-sm whitespace-nowrap">
          {new Date(order.created_at).toLocaleDateString()}
        </td>
        <td className="p-4">
          <ChevronDown
            size={20}
            className={`ml-auto text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={7} className="p-4 bg-zinc-50/50">
            {renderExpandedDetail(order)}
          </td>
        </tr>
      )}
    </>
  );
}

