import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE from '../config'

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', quantity: '', image_url: '' })
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  async function fetchProducts() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/products/?limit=100`)
      const data = await res.json()
      setProducts(data)
    } catch { console.error("fetch failed") }
    setLoading(false)
  }

  useEffect(() => {
    if (!token) { navigate("/login"); return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== "admin") { navigate("/"); return }
    } catch { navigate("/login"); return }
    fetchProducts()
  }, [])

  async function uploadImage() {
    if (!imageFile) return form.image_url
    setUploading(true)
    const formData = new FormData()
    formData.append("file", imageFile)
    const res = await fetch(`${API_BASE}/products/upload-image`, {
      method: "POST",
      headers: { "Authorization": "Bearer " + token },
      body: formData
    })
    const data = await res.json()
    setUploading(false)
    return data.image_url
  }

  async function handleSubmit() {
    const image_url = await uploadImage()
    const url = editProduct ? `${API_BASE}/products/${editProduct.id}` : `${API_BASE}/products/`
    const method = editProduct ? "PUT" : "POST"
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ ...form, image_url, price: parseFloat(form.price), quantity: parseInt(form.quantity) })
      })
      if (res.ok) {
        setShowForm(false)
        setEditProduct(null)
        setForm({ name: '', description: '', price: '', quantity: '', image_url: '' })
        setImageFile(null)
        fetchProducts()
      } else {
        const data = await res.json()
        alert(data.detail || "Something went wrong!")
      }
    } catch { alert("Error!") }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return
    try {
      await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
      })
      fetchProducts()
    } catch { alert("Delete failed!") }
  }

  function openEdit(product) {
    setEditProduct(product)
    setForm({ name: product.name, description: product.description, price: product.price, quantity: product.quantity, image_url: product.image_url || '' })
    setImageFile(null)
    setShowForm(true)
  }

  function openAdd() {
    setEditProduct(null)
    setForm({ name: '', description: '', price: '', quantity: '', image_url: '' })
    setImageFile(null)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-extrabold text-dark tracking-tight">
            Manage Products <span className="text-zinc-400 text-sm font-medium">({products.length} items)</span>
          </h1>
          <button onClick={openAdd}
            className="bg-brand text-white text-sm font-bold px-5 py-2.5 rounded-xl border-none hover:bg-brand-dark transition-colors cursor-pointer">
            + Add Product
          </button>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-extrabold text-dark mb-6">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h2>

              {[
                { label: 'Product Name', key: 'name', type: 'text', placeholder: 'e.g. Men Casual Tee' },
                { label: 'Description', key: 'description', type: 'text', placeholder: 'Product description...' },
                { label: 'Price (₹)', key: 'price', type: 'number', placeholder: 'e.g. 599' },
                { label: 'Quantity', key: 'quantity', type: 'number', placeholder: 'e.g. 50' },
              ].map((field) => (
                <div key={field.key} className="mb-4">
                  <label className="block text-[11px] font-bold text-dark uppercase tracking-wider mb-1.5">{field.label}</label>
                  <input type={field.type} placeholder={field.placeholder} value={form[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-400 transition-colors" />
                </div>
              ))}

              <div className="mb-4">
                <label className="block text-[11px] font-bold text-dark uppercase tracking-wider mb-1.5">Product Image</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200" />
                {imageFile && (
                  <img src={URL.createObjectURL(imageFile)} alt="preview" className="w-full h-40 object-cover rounded-lg mt-2" />
                )}
                {form.image_url && !imageFile && (
                  <img src={form.image_url} alt="current" className="w-full h-40 object-cover rounded-lg mt-2" />
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-border rounded-xl text-sm font-bold bg-white hover:bg-zinc-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={uploading}
                  className="flex-1 py-3 bg-brand text-white rounded-xl text-sm font-bold transition-all disabled:opacity-60 hover:bg-brand-dark cursor-pointer border-none">
                  {uploading ? 'Uploading...' : editProduct ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-sm font-medium text-zinc-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-50 border-b border-border">
                    {['Image', 'Name', 'Price', 'Quantity', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 bg-zinc-50 rounded-lg overflow-hidden flex items-center justify-center">
                          {p.image_url
                            ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            : <span className="text-xl">&#x1F455;</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-dark">{p.name}</div>
                        <div className="text-xs text-zinc-400 truncate max-w-[200px]">{p.description}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-dark">₹{p.price}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold ${p.quantity > 0 ? 'text-emerald-600' : 'text-brand'}`}>
                          {p.quantity > 0 ? p.quantity : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)}
                            className="px-4 py-1.5 bg-dark text-white text-[11px] font-bold rounded-lg border-none hover:bg-zinc-800 transition-colors cursor-pointer">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(p.id)}
                            className="px-4 py-1.5 bg-white text-brand text-[11px] font-bold rounded-lg border-2 border-brand hover:bg-rose-50 transition-colors cursor-pointer">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProducts
