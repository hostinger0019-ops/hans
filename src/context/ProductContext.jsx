import { createContext, useContext, useState, useEffect } from 'react'

const ProductContext = createContext(null)

/* ─── Default Products ─── */
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
    name: 'Classic Denim Jacket',
    description: 'Timeless denim jacket made from premium washed cotton denim. Classic fit with adjustable button cuffs.',
    price: 3499,
    comparePrice: 4499,
    category: 'Unisex',
    subcategory: 'Jackets',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Light Blue', 'Dark Blue'],
    stock: 80,
    images: ['https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=500&q=80'],
    videos: [],
    rating: 4.5,
    reviews: 78,
    status: 'published',
    featured: false,
    createdAt: '2026-06-25',
  },
  {
    id: 6,
    name: 'Silk Blend Blazer',
    description: 'Luxurious silk blend blazer with peak lapels. Perfect for formal events and power dressing.',
    price: 5999,
    comparePrice: 8999,
    category: 'Women',
    subcategory: 'Blazers',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Cream', 'Black'],
    stock: 30,
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80'],
    videos: [],
    rating: 4.8,
    reviews: 67,
    status: 'published',
    featured: true,
    createdAt: '2026-06-28',
  },
  {
    id: 7,
    name: 'Cargo Joggers',
    description: 'Comfortable cargo joggers with multiple pockets. Made from premium cotton-poly blend for durability.',
    price: 1999,
    comparePrice: 2999,
    category: 'Men',
    subcategory: 'Pants',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Olive', 'Grey'],
    stock: 150,
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80'],
    videos: [],
    rating: 4.4,
    reviews: 312,
    status: 'published',
    featured: false,
    createdAt: '2026-06-29',
  },
  {
    id: 8,
    name: 'Cropped Hoodie',
    description: 'Trendy cropped hoodie made from organic cotton. Features kangaroo pocket and adjustable drawstring hood.',
    price: 1799,
    comparePrice: 2499,
    category: 'Women',
    subcategory: 'Hoodies',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Pink', 'White'],
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
  { id: 'ORD-001', customer: 'Aisha Khan', email: 'aisha@example.com', items: 3, total: 9797, status: 'delivered', date: '2026-06-28', address: 'Mumbai, MH' },
  { id: 'ORD-002', customer: 'Rahul Sharma', email: 'rahul@example.com', items: 1, total: 4999, status: 'shipped', date: '2026-06-29', address: 'Delhi, DL' },
  { id: 'ORD-003', customer: 'Priya Patel', email: 'priya@example.com', items: 2, total: 5098, status: 'processing', date: '2026-06-30', address: 'Bangalore, KA' },
  { id: 'ORD-004', customer: 'Vikram Singh', email: 'vikram@example.com', items: 4, total: 12296, status: 'pending', date: '2026-07-01', address: 'Pune, MH' },
  { id: 'ORD-005', customer: 'Neha Gupta', email: 'neha@example.com', items: 1, total: 3299, status: 'delivered', date: '2026-06-27', address: 'Chennai, TN' },
  { id: 'ORD-006', customer: 'Arjun Reddy', email: 'arjun@example.com', items: 2, total: 6498, status: 'shipped', date: '2026-06-30', address: 'Hyderabad, TS' },
]

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('tarik_products')
    return saved ? JSON.parse(saved) : defaultProducts
  })

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('tarik_orders')
    return saved ? JSON.parse(saved) : defaultOrders
  })

  useEffect(() => {
    localStorage.setItem('tarik_products', JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem('tarik_orders', JSON.stringify(orders))
  }, [orders])

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      rating: 0,
      reviews: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setProducts(prev => [newProduct, ...prev])
    return newProduct
  }

  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const getProduct = (id) => {
    return products.find(p => p.id === parseInt(id))
  }

  const updateOrderStatus = (id, status) => {
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
      products, orders, stats,
      addProduct, updateProduct, deleteProduct, getProduct,
      updateOrderStatus,
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
