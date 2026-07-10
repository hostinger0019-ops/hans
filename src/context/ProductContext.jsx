import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { productsAPI, ordersAPI } from '../services/api'

const ProductContext = createContext(null)

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch products from API on mount
  const fetchProducts = useCallback(async () => {
    try {
      const data = await productsAPI.list({ limit: 100 })
      if (data.products) {
        setProducts(data.products)
      }
    } catch (err) {
      console.warn('⚠️ API unreachable:', err.message)
      setProducts([])
    }
  }, [])

  // Fetch orders from API (admin only)
  const fetchOrders = useCallback(async () => {
    try {
      const data = await ordersAPI.list()
      if (data.orders) {
        setOrders(data.orders)
      }
    } catch (err) {
      console.warn('⚠️ Orders API unavailable:', err.message)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchProducts()
      await fetchOrders()
      setLoading(false)
    }
    init()
  }, [fetchProducts, fetchOrders])

  const addProduct = async (product) => {
    try {
      const newProduct = await productsAPI.create({
        name: product.name,
        description: product.description || '',
        price: parseFloat(product.price),
        compare_price: product.comparePrice ? parseFloat(product.comparePrice) : null,
        category: product.category || 'Men',
        subcategory: product.subcategory || '',
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock: parseInt(product.stock) || 0,
        images: product.images || [],
        videos: product.videos || [],
        status: product.status || 'published',
        featured: product.featured || false,
      })
      setProducts(prev => [newProduct, ...prev])
      return newProduct
    } catch (err) {
      console.error('Failed to add product:', err)
      throw err
    }
  }

  const updateProduct = async (id, updates) => {
    try {
      // Map frontend camelCase to backend snake_case
      await productsAPI.update(id, {
        name: updates.name,
        description: updates.description || '',
        price: parseFloat(updates.price),
        compare_price: updates.comparePrice ? parseFloat(updates.comparePrice) : null,
        category: updates.category || 'Men',
        subcategory: updates.subcategory || '',
        sizes: updates.sizes || [],
        colors: updates.colors || [],
        stock: parseInt(updates.stock) || 0,
        images: updates.images || [],
        videos: updates.videos || [],
        status: updates.status || 'published',
        featured: updates.featured || false,
      })
    } catch (err) {
      console.warn('API update failed:', err.message)
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deleteProduct = async (id) => {
    try {
      await productsAPI.delete(id)
    } catch (err) {
      console.warn('API delete failed:', err.message)
    }
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const getProduct = (id) => {
    return products.find(p => p.id === parseInt(id))
  }

  const updateOrderStatus = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status)
    } catch (err) {
      console.warn('API status update failed:', err.message)
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    totalCustomers: new Set(orders.map(o => o.email)).size,
    publishedProducts: products.filter(p => p.status === 'published').length,
    lowStock: products.filter(p => p.stock < 20).length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    deliveredOrders: orders.filter(o => o.status === 'delivered').length,
  }

  return (
    <ProductContext.Provider value={{
      products, orders, stats, loading, error,
      addProduct, updateProduct, deleteProduct, getProduct,
      updateOrderStatus, fetchProducts, fetchOrders,
    }}>
      {children}
    </ProductContext.Provider>
  )
}

export const useProducts = () => {
  const context = useContext(ProductContext)
  if (!context) throw new Error('useProducts must be used within ProductProvider')
  return context
}

export default ProductContext
