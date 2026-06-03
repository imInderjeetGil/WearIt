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

  useEffect(() => {
    if (!token) { navigate("/login"); return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== "admin") { navigate("/"); return }
    } catch (e) { navigate("/login"); return }
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/products/?limit=100`)
      const data = await res.json()
      setProducts(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

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
    } catch (e) { alert("Error!") }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return
    try {
      await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
      })
      fetchProducts()
    } catch (e) { alert("Delete failed!") }
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
    <div className="responsive-page" style={{ background: '#f5f5f6', minHeight: '100vh' }}>

      <div className="admin-products-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', gap: '12px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a2e' }}>
          MANAGE PRODUCTS <span style={{ color: '#a8a8b3', fontSize: '14px', fontWeight: '400' }}>({products.length} items)</span>
        </h1>
        <button onClick={openAdd}
          style={{ background: '#f43f5e', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '4px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>
          + ADD PRODUCT
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>

            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a2e', marginBottom: '24px' }}>
              {editProduct ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
            </h2>

            {[
              { label: 'Product Name', key: 'name', type: 'text', placeholder: 'e.g. Men Casual Tee' },
              { label: 'Description', key: 'description', type: 'text', placeholder: 'Product description...' },
              { label: 'Price (₹)', key: 'price', type: 'number', placeholder: 'e.g. 599' },
              { label: 'Quantity', key: 'quantity', type: 'number', placeholder: 'e.g. 50' },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#1a1a2e', marginBottom: '6px', letterSpacing: '0.5px' }}>
                  {field.label.toUpperCase()}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  style={{ width: '100%', border: '2px solid #ebebeb', padding: '10px 14px', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}

            {/* Image Upload */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#1a1a2e', marginBottom: '6px', letterSpacing: '0.5px' }}>
                PRODUCT IMAGE
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files[0])}
                style={{ width: '100%', border: '2px solid #ebebeb', padding: '10px 14px', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
              {imageFile && (
                <img src={URL.createObjectURL(imageFile)} alt="preview"
                  style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '4px', marginTop: '8px' }} />
              )}
              {form.image_url && !imageFile && (
                <img src={form.image_url} alt="current"
                  style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '4px', marginTop: '8px' }} />
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: '12px', background: 'white', border: '2px solid #ebebeb', borderRadius: '4px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>
                CANCEL
              </button>
              <button onClick={handleSubmit} disabled={uploading}
                style={{ flex: 1, padding: '12px', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', opacity: uploading ? 0.7 : 1 }}>
                {uploading ? 'UPLOADING...' : editProduct ? 'UPDATE →' : 'ADD →'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#a8a8b3', fontWeight: '700' }}>Loading...</div>
      ) : (
        <div className="admin-table-wrap" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f6', borderBottom: '2px solid #ebebeb' }}>
                {['Image', 'Name', 'Price', 'Quantity', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#a8a8b3', letterSpacing: '0.5px' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f6' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#fff0f3', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '24px' }}>👕</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a2e' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#a8a8b3', marginTop: '2px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '700', color: '#1a1a2e' }}>₹{p.price}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: p.quantity > 0 ? '#2ecc71' : '#f43f5e' }}>
                      {p.quantity > 0 ? p.quantity : 'Out of Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEdit(p)}
                        style={{ padding: '6px 16px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                        EDIT
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                        style={{ padding: '6px 16px', background: 'white', color: '#f43f5e', border: '2px solid #f43f5e', borderRadius: '4px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminProducts