import { useCallback, useEffect, useState } from "react";
import { SlidersHorizontal, ArrowUpDown, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/auth-context";
import Container from "../../../shared/components/layout/Container";
import SearchBar from "../components/filters/SearchBar";
import FilterSidebar from "../components/filters/FilterSidebar";
import MobileFilterDrawer from "../components/filters/MobileFilterDrawer";
import SortDrawer from "../components/filters/SortDrawer";
import ProductCard from "../components/product/ProductCard";

import { getProducts } from "../api/products";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [sort, setSort] = useState("-created_at");

  const [minPrice, setMinPrice] = useState(null);

  const [maxPrice, setMaxPrice] = useState(null);

  const [filterOpen, setFilterOpen] = useState(false);

  const [sortOpen, setSortOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(null);

  const [sizeId, setSizeId] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";


  const clearFilters = () => {
    setSearch("");
    setSort("-created_at");

    setMinPrice(null);
    setMaxPrice(null);

    setCategoryId(null);
    setSizeId(null);
  };
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await getProducts({
        page: 1,
        limit: 12,
        search,
        sort,
        min_price: minPrice,
        max_price: maxPrice,
        category_id: categoryId,
        size_id: sizeId,
      });

      const list = Array.isArray(data)
        ? data
        : data.products || data.items || data.data || [];

      setProducts(list);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [search, sort, minPrice, maxPrice, categoryId, sizeId]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  return (
    <>
      <Container className="py-6 lg:py-12">

        {/* Heading */}

        <div className="mb-8">

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Collection
          </p>

          <h1 className="mt-2 text-3xl font-black lg:text-5xl">
            Products
          </h1>

        </div>

        {/* Search */}

        <div className="mb-6">
          <SearchBar
            search={search}
            setSearch={setSearch}
          />
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-10">

          {/* Desktop Sidebar */}

          <aside className="hidden lg:block">

            <FilterSidebar
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              sizeId={sizeId}
              setSizeId={setSizeId}
              clearFilters={clearFilters}
            />

          </aside>

          {/* Products */}

          <section>

            <div className="mb-6 flex items-center justify-between">

              <p className="text-sm text-zinc-500">

                {products.length} Products

              </p>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="
                  hidden
                  rounded-lg
                  border
                  px-4
                  py-2
                  lg:block
                "
              >

                <option value="-created_at">
                  Newest
                </option>

                <option value="price">
                  Price: Low to High
                </option>

                <option value="-price">
                  Price: High to Low
                </option>

              </select>

            </div>

            {loading ? (

              <div className="grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">

                {Array.from({ length: 8 }).map((_, index) => (

                  <div
                    key={index}
                    className="aspect-[3/4] rounded-xl bg-zinc-100 animate-pulse"
                  />

                ))}

              </div>

            ) : (

              <div className="grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">

                <>
  {isAdmin && (
    <Link
      to="/admin-panel/products/new"
      className="
        group
        flex
        aspect-3/4
        flex-col
        items-center
        justify-center
        rounded-2xl
        border-2
        border-dashed
        border-zinc-300
        transition
        hover:border-black
        hover:bg-zinc-50
      "
    >
      <div
        className="
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-zinc-100
          transition
          group-hover:bg-black
          group-hover:text-white
        "
      >
        <Plus size={34} />
      </div>

      <p className="mt-6 text-lg font-semibold">
        Add Product
      </p>    
    </Link>
  )}

  {products.map((product) => (
    <ProductCard
      key={product.id}
      product={product}
    />
  ))}
</>

              </div>

            )}

          </section>

        </div>

      </Container>

      {/* Mobile Filter */}

      <MobileFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        sizeId={sizeId}
        setSizeId={setSizeId}
        clearFilters={clearFilters}
      />

      {/* Mobile Sort */}

      <SortDrawer
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        sort={sort}
        setSort={setSort}
      />

      {/* Bottom Mobile Bar */}

      <div
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-40
          border-t
          bg-white
          lg:hidden
        "
      >

        <div className="grid grid-cols-2">

          <button
            onClick={() => setFilterOpen(true)}
            className="
              flex
              items-center
              justify-center
              gap-2
              py-4
              font-medium
            "
          >
            <SlidersHorizontal size={18} />

            Filter

          </button>

          <button
            onClick={() => setSortOpen(true)}
            className="
              flex
              items-center
              justify-center
              gap-2
              border-l
              py-4
              font-medium
            "
          >
            <ArrowUpDown size={18} />

            Sort

          </button>

        </div>

      </div>

      {/* Space for mobile bottom bar */}

      <div className="h-20 lg:hidden" />
    </>
  );
}
