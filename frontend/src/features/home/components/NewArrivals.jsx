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
    <section className="py-28">

      <div className="max-w-[1500px] mx-auto px-8">

        <div className="flex items-end justify-between mb-14">

          <div>

            <p className="uppercase tracking-[0.35em] text-xs text-zinc-500 mb-3">
              Latest Drop
            </p>

            <h2 className="text-5xl font-black uppercase">
              New Arrivals
            </h2>

          </div>

          <Link
            to="/products"
            className="uppercase tracking-[0.25em] text-sm hover:underline"
          >
            View All
          </Link>

        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">

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
