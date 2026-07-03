import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { productsAPI, ordersAPI } from '../services/api'

const ProductContext = createContext(null)

/* ─── Default Products (fallback if API is unreachable) ─── */
const defaultProducts = [
  {
    id: 1,
    name: 'Premium Leather Jacket',
    description: 'Handcrafted genuine leather jacket with a modern slim fit. Features premium YKK zippers and satin lining for ultimate comfort.',
    price: 4999,
    comparePrice: 7999,
    category: 'Men',
    subcategory: 'Jackets',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Brown'],
    stock: 45,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80'],
    videos: [],
    rating: 4.8,
    reviews: 124,
    status: 'published',
    featured: true,
    createdAt: '2026-06-15',
  },
  {
    id: 2,
    name: 'Oversized Graphic Tee',
    description: 'Premium cotton oversized tee with exclusive graphic print. Relaxed fit for maximum comfort and street style appeal.',
    price: 1299,
    comparePrice: 1999,
    category: 'Unisex',
    subcategory: 'T-Shirts',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Grey'],
    stock: 200,
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80'],
    videos: [],
    rating: 4.6,
    reviews: 89,
    status: 'published',
    featured: true,
    createdAt: '2026-06-18',
  },
  {
    id: 3,
    name: 'Slim Fit Chinos',
    description: 'Premium stretch cotton chinos with a modern slim fit. Perfect for both casual and semi-formal occasions.',
    price: 2499,
    comparePrice: 3499,
    category: 'Men',
    subcategory: 'Pants',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Khaki', 'Navy', 'Olive'],
    stock: 120,
    images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&q=80'],
    videos: [],
    rating: 4.7,
    reviews: 203,
    status: 'published',
    featured: false,
    createdAt: '2026-06-20',
  },
  {
    id: 4,
    name: 'Floral Wrap Dress',
    description: 'Elegant floral wrap dress crafted from premium viscose fabric. Features adjustable waist tie and flowy silhouette.',
    price: 3299,
    comparePrice: 4999,
    category: 'Women',
    subcategory: 'Dresses',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Burgundy', 'Navy'],
    stock: 65,
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80'],
    videos: [],
    rating: 4.9,
    reviews: 156,
    status: 'published',
    featured: true,
    createdAt: '2026-06-22',
  },
  {
    id: 5,
    name: 'Denim Trucker Jacket',
    description: 'Classic denim trucker jacket with modern updates. Premium selvedge denim with copper button hardware.',
    price: 3799,
    comparePrice: 5499,
    category: 'Unisex',
    subcategory: 'Jackets',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Indigo', 'Light Wash', 'Black'],
    stock: 78,
    images: ['https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=500&q=80'],
    videos: [],
    rating: 4.5,
    reviews: 67,
    status: 'published',
    featured: false,
    createdAt: '2026-06-25',
  },
  {
    id: 6,
    name: 'Silk Blend Blazer',
    description: 'Luxurious silk-blend blazer with Italian craftsmanship. Peak lapels, dual vents, and horn buttons.',
    price: 8999,
    comparePrice: 12999,
    category: 'Women',
    subcategory: 'Blazers',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Ivory', 'Black'],
    stock: 30,
    images: ['https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500&q=80'],
    videos: [],
    rating: 4.9,
    reviews: 42,
    status: 'published',
    featured: true,
    createdAt: '2026-06-27',
  },
  {
    id: 7,
    name: 'Urban Cargo Pants',
    description: 'Modern utility cargo pants with tapered fit. Multiple pockets with secure zip closures and adjustable hem.',
    price: 2799,
    comparePrice: 3999,
    category: 'Men',
    subcategory: 'Pants',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Olive', 'Beige'],
    stock: 150,
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80'],
    videos: [],
    rating: 4.4,
    reviews: 178,
    status: 'published',
    featured: false,
    createdAt: '2026-06-28',
  },
  {
    id: 8,
    name: 'Classic Hoodie',
    description: 'Premium heavyweight cotton hoodie with minimalist design. Double-layered hood and kangaroo pocket.',
    price: 1799,
    comparePrice: 2499,
    category: 'Unisex',
    subcategory: 'Hoodies',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Grey', 'Navy', 'Forest Green'],
    stock: 95,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80'],
    videos: [],
    rating: 4.6,
    reviews: 145,
    status: 'published',
    featured: false,
    createdAt: '2026-06-30',
  },
]

const defaultOrders = [
  { id: 'TRK-001', customer: 'Aisha Khan', email: 'aisha@example.com', items: 3, total: 9797, status: 'delivered', date: '2026-06-28', address: 'Mumbai, MH' },
  { id: 'TRK-002', customer: 'Rahul Sharma', email: 'rahul@example.com', items: 1, total: 4999, status: 'shipped', date: '2026-06-29', address: 'Delhi, DL' },
  { id: 'TRK-003', customer: 'Priya Patel', email: 'priya@example.com', items: 2, total: 5098, status: 'processing', date: '2026-06-30', address: 'Bangalore, KA' },
  { id: 'TRK-004', customer: 'Vikram Singh', email: 'vikram@example.com', items: 4, total: 12296, status: 'pending', date: '2026-07-01', address: 'Pune, MH' },
  { id: 'TRK-005', customer: 'Neha Gupta', email: 'neha@example.com', items: 1, total: 3299, status: 'delivered', date: '2026-06-27', address: 'Chennai, TN' },
  { id: 'TRK-006', customer: 'Arjun Reddy', email: 'arjun@example.com', items: 2, total: 6498, status: 'shipped', date: '2026-06-30', address: 'Hyderabad, TS' },
]

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(defaultProducts)
  const [orders, setOrders] = useState(defaultOrders)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch products from API on mount
  const fetchProducts = useCallback(async () => {
    try {
      const data = await productsAPI.list({ limit: 100 })
      if (data.products && data.products.length > 0) {
        setProducts(data.products)
      }
    } catch (err) {
      console.warn('⚠️ API unreachable, using default products:', err.message)
      // Keep default products as fallback
    }
  }, [])

  // Fetch orders from API (admin only)
  const fetchOrders = useCallback(async () => {
    try {
      const data = await ordersAPI.list()
      if (data.orders && data.orders.length > 0) {
        setOrders(data.orders)
      }
    } catch (err) {
      // Orders require auth, silently fall back to defaults
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
      // Fallback: add locally
      const localProduct = {
        ...product,
        id: Date.now(),
        rating: 0,
        reviews: 0,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setProducts(prev => [localProduct, ...prev])
      return localProduct
    }
  }

  const updateProduct = async (id, updates) => {
    try {
      await productsAPI.update(id, updates)
    } catch (err) {
      console.warn('API update failed, updating locally:', err.message)
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deleteProduct = async (id) => {
    try {
      await productsAPI.delete(id)
    } catch (err) {
      console.warn('API delete failed, deleting locally:', err.message)
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
      console.warn('API status update failed, updating locally:', err.message)
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
