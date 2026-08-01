import { TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";

export default function InventoryAlert({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="
        flex
        items-center
        justify-between
        rounded-2xl
        border
        p-4
        transition
        hover:bg-red-50
      "
    >
      <div className="flex items-center gap-3">

        <TriangleAlert
          size={20}
          className="text-red-500"
        />

        <div>

          <h3 className="font-semibold">
            {product.name}
          </h3>

          <p className="text-sm text-zinc-500">
            {product.brand}
          </p>

        </div>

      </div>

      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
        {product.quantity} left
      </span>
    </Link>
  );
}