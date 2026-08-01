import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
};

export default function RecentOrderCard({ order }) {
  const item = order.items?.[0];

  if (!item) return null;

  return (
    <Link
      to="/admin-panel/orders"
      className="
        flex
        items-center
        gap-4
        rounded-2xl
        border
        p-4
        transition
        hover:bg-zinc-50
      "
    >
      <img
        src={item.product.image_url}
        alt={item.product.name}
        className="h-16 w-16 rounded-xl object-cover"
      />

      <div className="min-w-0 flex-1">

        <h3 className="truncate font-semibold">
          {item.product.name}
        </h3>

        <p className="text-sm text-zinc-500">
          {order.user?.name}
        </p>

        <div className="mt-2 flex items-center gap-2">

          <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">
            Size {item.size?.name}
          </span>

          <span
            className={`rounded-full px-2 py-1 text-xs ${
              statusColors[order.status]
            }`}
          >
            {order.status}
          </span>

        </div>

      </div>

      <div className="text-right">

        <p className="font-bold">
          ₹{order.total_amount}
        </p>

        <ArrowRight
          className="ml-auto mt-2 text-zinc-400"
          size={18}
        />

      </div>

    </Link>
  );
}