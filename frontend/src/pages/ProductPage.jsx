import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../api/products";
import {toast} from "react-hot-toast";
import useCartStore from "../store/cartStore";


export default function ProductPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState(null);

  const [selectedColor, setSelectedColor] = useState(null);

  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCartStore();

async function handleAddToCart() {
  try {
    await addItem(product.id);

    toast.success("Added to cart");
  } catch {
    toast.error("Failed to add to cart");
  }
}

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    try {
      setLoading(true);

      const { data } = await getProduct(id);

      setProduct(data);

      if (data.sizes.length > 0) {
        setSelectedSize(data.sizes[0]);
      }

      if (data.colors.length > 0) {
        setSelectedColor(data.colors[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10 animate-pulse">

        <div className="grid lg:grid-cols-2 gap-12">

          <div className="aspect-square bg-zinc-200 rounded-xl" />

          <div className="space-y-5">

            <div className="h-4 w-24 bg-zinc-200 rounded" />

            <div className="h-10 w-80 bg-zinc-200 rounded" />

            <div className="h-8 w-40 bg-zinc-200 rounded" />

            <div className="space-y-2">
              <div className="h-4 bg-zinc-200 rounded" />
              <div className="h-4 bg-zinc-200 rounded" />
              <div className="h-4 w-3/4 bg-zinc-200 rounded" />
            </div>

          </div>

        </div>

      </section>
    );
  }

  if (!product) {
    return (
      <section className="py-20 text-center">

        <h2 className="text-3xl font-bold">
          Product not found
        </h2>

      </section>
    );
  }

  return (
    <>
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">

        <div className="grid lg:grid-cols-2 gap-14">

          {/* Image */}

          <div>

            <div className="aspect-square bg-zinc-100 overflow-hidden rounded-2xl">

              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />

            </div>

          </div>

          {/* Info */}

          <div>

            <p className="uppercase tracking-[0.3em] text-xs text-zinc-500">

              {product.category.name}

            </p>

            <h1 className="text-4xl lg:text-5xl font-black mt-3">

              {product.name}

            </h1>

            <p className="mt-2 text-zinc-500">

              {product.brand}

            </p>

            <div className="flex items-center gap-4 mt-8">

              <span className="text-3xl font-bold">

                ₹{product.discount_price ?? product.price}

              </span>

              {product.discount_price && (

                <span className="text-xl line-through text-zinc-400">

                  ₹{product.price}

                </span>

              )}

            </div>

            <p className="mt-8 leading-8 text-zinc-600">

              {product.description}

            </p>

            {/* Sizes */}

            <div className="mt-10">

              <h3 className="font-semibold mb-4">

                Select Size

              </h3>

              <div className="flex flex-wrap gap-3">

                {product.sizes.map((size) => (

                  <button
                    key={size.size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 min-w-12 px-5 rounded-lg border transition

                    ${
                      selectedSize?.size.id === size.size.id
                        ? "bg-black text-white border-black"
                        : "hover:border-black"
                    }`}
                  >

                    {size.size.name}

                  </button>

                ))}

              </div>

            </div>

            {/* Colors */}

            <div className="mt-10">

              <h3 className="font-semibold mb-4">

                Colors

              </h3>

              <div className="flex gap-4">

                {product.colors.map((color) => (

                  <button
                    key={color.color.id}
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 w-10 rounded-full border-4 transition

                    ${
                      selectedColor?.color.id === color.color.id
                        ? "border-black"
                        : "border-transparent"
                    }`}
                    style={{
                      backgroundColor: color.color.hex_code,
                    }}
                  />

                ))}

              </div>

            </div>

            {/* Quantity */}

            <div className="mt-10">

              <h3 className="font-semibold mb-4">

                Quantity

              </h3>

              <div className="flex w-fit items-center border rounded-lg">

                <button
                  onClick={() =>
                    setQuantity((q) => Math.max(1, q - 1))
                  }
                  className="w-12 h-12"
                >
                  −
                </button>

                <span className="w-14 text-center">

                  {quantity}

                </span>

                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-12 h-12"
                >
                  +
                </button>

              </div>

            </div>

            {/* Button */}

            <button
            onClick={handleAddToCart}
              className="mt-12 h-14 w-full rounded-xl bg-black text-white font-semibold hover:bg-zinc-800 transition"
            >

              Add To Cart

            </button>

          </div>

        </div>

      </section>

      {/* Sticky Mobile Button */}

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4">

        <button
  onClick={handleAddToCart}
  className="mt-12 hidden h-14 w-full rounded-xl bg-black text-white font-semibold transition hover:bg-zinc-800 lg:block"
>
  Add To Cart
</button>

      </div>
    </>
  );
}