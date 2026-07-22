import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoAdd, IoCreateOutline, IoTrashOutline } from 'react-icons/io5'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import { formatPrice, isAdmin } from '../utils/helpers'
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../api/products'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', price: '', quantity: '' })
  const [file, setFile] = useState(null)

  const loadProducts = useCallback(async () => {
    try {
      const { data } = await getProducts({ limit: 100 })
      setProducts(Array.isArray(data) ? data : [])
    } catch { toast.error('Failed to load products') }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isAdmin()) { navigate('/'); return }
    loadProducts()
  }, [loadProducts, navigate])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', price: '', quantity: '' })
    setFile(null)
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setForm({ name: product.name, description: product.description, price: String(product.price), quantity: String(product.quantity) })
    setFile(null)
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error('Name and price are required')
      return
    }
    setSaving(true)
    try {
      let image_url = editing?.image_url || ''
      if (file) {
        const { data } = await uploadProductImage(file)
        image_url = data.image_url
      }
      const payload = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) || 0, image_url }

      if (editing) {
        await updateProduct(editing.id, payload)
        toast.success('Product updated')
      } else {
        await createProduct(payload)
        toast.success('Product created')
      }
      setModalOpen(false)
      loadProducts()
    } catch { toast.error('Failed to save product') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast.success('Product deleted')
    } catch { toast.error('Failed to delete product') }
  }

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-12"><Skeleton className="h-8 w-48 mb-8" /><Skeleton className="h-96 w-full" /></div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-medium">Admin</span>
          <h1 className="text-2xl font-display font-bold mt-1">Products</h1>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <IoAdd size={16} className="mr-1" /> Add Product
        </Button>
      </div>

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-border">
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-muted font-medium">Image</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-muted font-medium">Name</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-muted font-medium">Price</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-muted font-medium">Stock</th>
              <th className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border/50 hover:bg-zinc-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="w-12 h-14 bg-zinc-100 overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-200 text-[10px]">—</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3">{formatPrice(product.price)}</td>
                <td className="px-4 py-3">{product.quantity}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(product)} className="p-1.5 text-muted hover:text-foreground transition-colors cursor-pointer" title="Edit">
                      <IoCreateOutline size={16} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 text-muted hover:text-brand transition-colors cursor-pointer" title="Delete">
                      <IoTrashOutline size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted text-sm">No products yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <div className="space-y-4">
          <Input label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cotton T-Shirt" />
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.15em] text-muted mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Product description..."
              rows={3}
              className="w-full px-4 py-3 bg-transparent border border-border text-foreground placeholder:text-zinc-400 focus:outline-none focus:border-foreground text-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="999" />
            <Input label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="50" />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.15em] text-muted mb-1.5">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-medium file:bg-zinc-100 file:text-foreground hover:file:bg-zinc-200"
            />
            {(file || editing?.image_url) && (
              <div className="mt-2 w-20 h-20 bg-zinc-100 overflow-hidden">
                <img
                  src={file ? URL.createObjectURL(file) : editing?.image_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
