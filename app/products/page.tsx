'use client'
import { useState, useEffect, useCallback } from 'react'
import { Product } from '@prisma/client'

interface ProductForm {
  name: string
  sku: string
  description: string
  quantityOnHand: string
  costPrice: string
  sellingPrice: string
  lowStockThreshold: string
}

const emptyForm: ProductForm = {
  name: '',
  sku: '',
  description: '',
  quantityOnHand: '0',
  costPrice: '',
  sellingPrice: '',
  lowStockThreshold: '',
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState<string>('')
  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const fetchProducts = useCallback(async () => {
    const res = await fetch(`/api/products?q=${search}`)
    const data: Product[] = await res.json()
    setProducts(data)
  }, [search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  const openEdit = async (id: string) => {
    const res = await fetch(`/api/products/${id}`)
    console.log({res})
    console.log({id:id})
    const p: Product = await res.json()
    setEditingId(id)
    setForm({
      name: p.name,
      sku: p.sku,
      description: p.description || '',
      quantityOnHand: String(p.quantityOnHand),
      costPrice: p.costPrice ? String(p.costPrice) : '',
      sellingPrice: p.sellingPrice ? String(p.sellingPrice) : '',
      lowStockThreshold: p.lowStockThreshold ? String(p.lowStockThreshold) : '',
    })
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log({editingId})

    const url = editingId ? `/api/products/${editingId}` : '/api/products'
    const method = editingId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) return setError(data.error)

    closeModal()
    fetchProducts()
  }

 

  const updateForm = (key: keyof ProductForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }


  const handleDelete = async (id: string) => {
  const confirmDelete = confirm("Are you sure you want to delete this product?");
  if (!confirmDelete) return;

  const res = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Failed to delete product");
    return;
  }

  fetchProducts();
};

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Products</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <i className="ti ti-plus text-base" />
          Add product
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-xs mb-4">
        <i className="ti ti-search text-gray-400 text-base" />
        <input
          type="text"
          placeholder="Search by name or SKU..."
          className="text-sm bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100">
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">
            {search ? 'No products match your search.' : 'No products yet. Add your first one!'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Name</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">SKU</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Qty</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Selling price</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p: Product) => {
                const isLow: boolean = p.quantityOnHand <= (p.lowStockThreshold ?? 5)
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-5 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                    <td className="px-5 py-3 text-gray-700">{p.quantityOnHand}</td>
                    <td className="px-5 py-3 text-gray-700">
                      {p.sellingPrice ? `$${Number(p.sellingPrice).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-5 py-3">
                      {isLow ? (
                        <span className="bg-red-50 text-red-700 text-xs font-medium px-2 py-0.5 rounded-md">
                          Low stock
                        </span>
                      ) : (
                        <span className="bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-md">
                          In stock
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 flex items-center gap-3">
                      <button
                        onClick={() => openEdit(p.id)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Edit
                      </button>
                       <button
    onClick={() => handleDelete(p.id)}
    className="text-red-600 hover:underline text-xs"
  >
    Delete
  </button>
                    
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">
                {editingId ? 'Edit product' : 'Add product'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <i className="ti ti-x text-lg" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g. Blue T-Shirt"
                  value={form.name}
                  onChange={e => updateForm('name', e.target.value)}
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  placeholder="e.g. TSHIRT-BLU-M"
                  value={form.sku}
                  onChange={e => updateForm('sku', e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Optional description"
                  value={form.description}
                  onChange={e => updateForm('description', e.target.value)}
                />
              </div>

              {/* Qty + Threshold */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity on hand
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    value={form.quantityOnHand}
                    onChange={e => updateForm('quantityOnHand', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low stock threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Default (5)"
                    value={form.lowStockThreshold}
                    onChange={e => updateForm('lowStockThreshold', e.target.value)}
                  />
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="0.00"
                    value={form.costPrice}
                    onChange={e => updateForm('costPrice', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="0.00"
                    value={form.sellingPrice}
                    onChange={e => updateForm('sellingPrice', e.target.value)}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
                >
                  {loading ? 'Saving...' : editingId ? 'Save changes' : 'Add product'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}