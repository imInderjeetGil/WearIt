import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import API_BASE from '../config'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || "")
  const [sort, setSort] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [page, sort])

  async function fetchProducts() {
    setLoading(true)
    try {
      let url = `${API_BASE}/products/?page=${page}&limit=8`
      if (sort) url += `&sort=${sort}`
      if (search) url += `&search=${search}`

      const res = await fetch(url)
      const data = await res.json()
      setProducts(data)
    } catch (e) {
      console.error("Fetch failed", e)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl md:text-2xl font-extrabold text-dark tracking-tight">
            All Products <span className="text-zinc-400 text-sm font-medium">({products.length} items)</span>
          </h1>

          <div className="flex gap-3">
            <div className="relative flex-1 sm:flex-none">
              <input placeholder="Search clothes..." value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyUp={e => { if (e.key === 'Enter') { setPage(1); fetchProducts() } }}
                className="w-full sm:w-56 border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-400 transition-colors bg-white" />
            </div>
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}
              className="border border-border rounded-lg px-4 py-2.5 text-sm font-medium outline-none focus:border-zinc-400 transition-colors bg-white">
              <option value="">Sort By</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-border overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-zinc-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-zinc-100 rounded w-3/4" />
                  <div className="h-3 bg-zinc-100 rounded w-full" />
                  <div className="h-5 bg-zinc-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">&#x1F6CD;</div>
            <p className="text-lg font-bold text-zinc-400">No products found</p>
            <button onClick={() => { setSearch(""); setPage(1); fetchProducts() }}
              className="mt-4 text-sm font-semibold text-brand bg-rose-50 px-5 py-2.5 rounded-lg border border-brand-light cursor-pointer hover:bg-rose-100 transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {products.map((p) => (
                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)}
                  className="group bg-white rounded-xl border border-border overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                  <div className="aspect-[3/4] bg-zinc-50 relative overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">&#x1F455;</div>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="text-sm font-semibold text-dark mb-0.5 truncate">{p.name}</h3>
                    <p className="text-xs text-zinc-400 mb-2 truncate">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-dark">₹{p.price}</span>
                      <span className={`text-[11px] font-semibold ${p.quantity > 0 ? 'text-emerald-600' : 'text-brand'}`}>
                        {p.quantity > 0 ? `${p.quantity} in stock` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-5 py-2.5 border border-border rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 bg-white cursor-pointer">
                &larr; Prev
              </button>
              <span className="text-sm font-bold text-zinc-600">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={products.length < 8}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-dark text-white hover:bg-zinc-800 cursor-pointer">
                Next &rarr;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Products
