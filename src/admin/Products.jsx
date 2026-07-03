import { useState } from 'react'
import { useProducts } from '../context/ProductContext'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Edit, Trash2, Eye, MoreVertical, Filter } from 'lucide-react'
import './Products.css'

const Products = () => {
  const { products, deleteProduct } = useProducts()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const categories = ['All', ...new Set(products.map(p => p.category))]

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = categoryFilter === 'All' || p.category === categoryFilter
    const matchStatus = statusFilter === 'All' || p.status === statusFilter
    return matchSearch && matchCategory && matchStatus
  })

  const handleDelete = (id) => {
    deleteProduct(id)
    setDeleteConfirm(null)
  }

  return (
    <div className="products-page" id="admin-products">
      <div className="products-page__header">
        <div>
          <h1 className="products-page__title">Products</h1>
          <p className="products-page__subtitle">{products.length} total products</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/products/new')} id="add-product-btn">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="products-page__filters">
        <div className="products-page__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="products-page__search-input"
          />
        </div>
        <div className="products-page__filter-group">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="products-page__select">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="products-page__select">
            <option value="All">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-page__table-wrap">
        <table className="products-page__table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(product => (
              <tr key={product.id}>
                <td>
                  <div className="products-page__product">
                    <img src={product.images[0]} alt={product.name} className="products-page__product-img" />
                    <div>
                      <span className="products-page__product-name">{product.name}</span>
                      <span className="products-page__product-id">ID: {product.id}</span>
                    </div>
                  </div>
                </td>
                <td><span className="products-page__category-badge">{product.category}</span></td>
                <td>
                  <div className="products-page__price">
                    <span className="products-page__price-current">₹{product.price.toLocaleString()}</span>
                    {product.comparePrice && (
                      <span className="products-page__price-compare">₹{product.comparePrice.toLocaleString()}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`products-page__stock ${product.stock < 20 ? 'products-page__stock--low' : ''}`}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-badge--${product.status === 'published' ? 'delivered' : 'pending'}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <div className="products-page__actions">
                    <button className="products-page__action-btn" title="Edit" onClick={() => navigate(`/admin/products/edit/${product.id}`)}>
                      <Edit size={16} />
                    </button>
                    <button className="products-page__action-btn products-page__action-btn--danger" title="Delete" onClick={() => setDeleteConfirm(product.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="products-page__empty">
            <Package size={48} />
            <p>No products found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="products-page__modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="products-page__modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Product?</h3>
            <p>This action cannot be undone.</p>
            <div className="products-page__modal-actions">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn" style={{ background: '#e74c3c', color: '#fff' }} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
