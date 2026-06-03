import { useState, useEffect } from 'react'
import API_BASE from '../config'
function Products() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [sort, setSort] = useState("")

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
        <div className="responsive-page" style={{ background: '#f5f5f6', minHeight: '100vh' }}>

            {/* Header */}
            <div className="products-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', gap: '12px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a2e' }}>
                    ALL PRODUCTS <span style={{ color: '#a8a8b3', fontSize: '14px', fontWeight: '400' }}>({products.length} items)</span>
                </h1>

                <div className="products-controls" style={{ display: 'flex', gap: '12px' }}>
                    <input
                        placeholder="Search clothes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyUp={e => { if (e.key === 'Enter') { setPage(1); fetchProducts() } }}
                        style={{ border: '2px solid #ebebeb', padding: '8px 16px', borderRadius: '4px', fontSize: '14px', outline: 'none', width: '220px', background: 'white' }}
                    />
                    <select
                        value={sort}
                        onChange={e => { setSort(e.target.value); setPage(1) }}
                        style={{ border: '2px solid #ebebeb', padding: '8px 16px', borderRadius: '4px', fontSize: '14px', outline: 'none', background: 'white', fontWeight: '600' }}
                    >
                        <option value="">Sort By</option>
                        <option value="price">Price: Low to High</option>
                        <option value="-price">Price: High to Low</option>
                        <option value="name">Name: A-Z</option>
                    </select>
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px', fontSize: '18px', color: '#a8a8b3', fontWeight: '700' }}>
                    Loading...
                </div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛍️</div>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#a8a8b3' }}>No products found</p>
                </div>
            ) : (
                <>
                    {/* Product Grid */}
                    <div className="products-grid" style={{ display: 'grid', gap: '16px' }}>
                        {products.map((p) => (
                            <div key={p.id}
                                onClick={() => window.location.href = `/product/${p.id}`}
                                style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer' }}
                            >
                                {/* Image */}
                                <div style={{ height: '240px', background: '#fff0f3', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                                    {p.image_url ? (
                                        <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '70px' }}>👕</span>
                                    )}
                                </div>

                                {/* Info */}
                                <div style={{ padding: '12px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a2e', marginBottom: '6px' }}>{p.name}</div>
                                    <div style={{ fontSize: '13px', color: '#7e7e7e', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</div>
                                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a2e' }}>₹{p.price}</div>
                                    <div style={{ fontSize: '12px', color: p.quantity > 0 ? '#2ecc71' : '#f43f5e', fontWeight: '700', marginTop: '4px' }}>
                                        {p.quantity > 0 ? `${p.quantity} in stock` : 'Out of Stock'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                        padding: '8px 24px',
                        border: '2px solid #ebebeb',
                        borderRadius: '4px',
                        fontWeight: '700',
                        cursor: page === 1 ? 'not-allowed' : 'pointer',
                        background: 'white',
                        color: page === 1 ? '#a8a8b3' : '#1a1a2e'
                    }}
                >
                    ← Prev
                </button>

                <span style={{ fontWeight: '700', color: '#1a1a2e' }}>
                    Page {page}
                </span>

                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={products.length < 8}
                    style={{
                        padding: '8px 24px',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: '700',
                        cursor: products.length < 8 ? 'not-allowed' : 'pointer',
                        background: products.length < 8 ? '#e2e2e2' : '#1a1a2e',
                        color: products.length < 8 ? '#a8a8b3' : 'white'
                    }}
                >
                    Next →
                </button>
            </div>



        </div>
    )
}

export default Products