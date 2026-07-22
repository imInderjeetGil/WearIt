import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { IoFilter, IoClose, IoSearch } from 'react-icons/io5'
import ProductCard from '../components/product/ProductCard'
import { ProductGridSkeleton } from '../components/ui/Skeleton'
import Button from '../components/ui/Button'
import { getProducts } from '../api/products'
import { SORT_OPTIONS } from '../utils/constants'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [, setTotal] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const limit = 12

  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || ''
  const category = searchParams.get('category') || ''
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''

  useEffect(() => {
    setLoading(true)
    const params = { page, limit, sort, search: search || undefined }
    if (minPrice) params.min_price = minPrice
    if (maxPrice) params.max_price = maxPrice

    getProducts(params)
      .then(({ data }) => {
        setProducts(Array.isArray(data) ? data : [])
        setTotal(data.length || 0)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [page, sort, search, minPrice, maxPrice])

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    setSearchParams(params)
    setPage(1)
  }

  const clearFilters = () => {
    setSearchParams({})
    setPage(1)
  }

  const hasFilters = search || sort || minPrice || maxPrice

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-medium">Products</span>
          <h1 className="text-2xl md:text-3xl font-display font-bold mt-1">
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products'}
          </h1>
          {search && (
            <p className="text-sm text-muted mt-1">Results for "{search}"</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <IoSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              className="pl-9 pr-4 py-2.5 text-sm bg-zinc-50 border border-border focus:outline-none focus:border-foreground w-48"
            />
          </div>
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="text-sm bg-zinc-50 border border-border px-3 py-2.5 focus:outline-none focus:border-foreground"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden p-2.5 border border-border hover:bg-zinc-50 cursor-pointer"
          >
            <IoFilter size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className={`md:block w-56 flex-shrink-0 ${filtersOpen ? 'block' : 'hidden'}`}>
          <div className="md:sticky md:top-24 space-y-6">
            {/* Price Range */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-[0.15em] mb-3">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParam('min_price', e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-border px-3 py-2 focus:outline-none focus:border-foreground"
                />
                <span className="self-center text-muted text-xs">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParam('max_price', e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-border px-3 py-2 focus:outline-none focus:border-foreground"
                />
              </div>
            </div>

            {/* Active Filters */}
            {hasFilters && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-[0.15em] mb-3">Active Filters</h3>
                <div className="space-y-1">
                  {search && (
                    <span className="inline-flex items-center gap-1 text-xs bg-zinc-100 px-2 py-1">
                      "{search}"
                      <IoClose size={12} className="cursor-pointer" onClick={() => updateParam('search', '')} />
                    </span>
                  )}
                  <button onClick={clearFilters} className="block text-xs text-brand hover:underline mt-2 cursor-pointer">
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
              Reset
            </Button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <ProductGridSkeleton count={limit} />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted text-sm mb-4">No products found</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>

              {/* Pagination */}
              {products.length >= limit && (
                <div className="flex justify-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="self-center text-xs text-muted">Page {page}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={products.length < limit}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
