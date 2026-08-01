import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../../catalog/components/product/ProductCard";

import { getProducts } from "../../catalog/api/products";

export default function NewArrivals() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
  getProducts({
    limit: 8,
    sort: "-created_at",
  })
    .then((res) => {
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.data ||
          res.data.products ||
          res.data.items ||
          [];

      setProducts(data);
    })
    .catch(console.error);
}, []);

  return (
    <section className="py-12 sm:py-20 lg:py-28">

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-end justify-between mb-8 sm:mb-14">

          <div>

            <p className="uppercase tracking-[0.25em] sm:tracking-[0.35em] text-xs text-zinc-500 mb-2 sm:mb-3">
              Latest Drop
            </p>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
              New Arrivals
            </h2>

          </div>

          <Link
            to="/products"
            className="uppercase tracking-[0.2em] text-xs sm:text-sm font-semibold hover:underline shrink-0"
          >
            View All
          </Link>

        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-4 lg:gap-8">

          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>

      </div>

    </section>
  );
}
