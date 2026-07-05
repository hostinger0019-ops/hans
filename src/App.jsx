import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProductProvider } from './context/ProductContext'
import { CartProvider } from './context/CartContext'

/* Storefront */
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import ProductDetail from './pages/ProductDetail'
import ShopPage from './pages/ShopPage'
import CategoryPage from './pages/CategoryPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmation from './pages/OrderConfirmation'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'

/* Admin */
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import Products from './admin/Products'
import AddProduct from './admin/AddProduct'
import Orders from './admin/Orders'
import ReelsManager from './admin/ReelsManager'
import Analytics from './admin/Analytics'
import Settings from './admin/Settings'

/* Protected Route */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <AdminLogin />
  return children
}

/* Storefront Layout */
const StorefrontLayout = () => (
  <>
    <Navbar />
    <LandingPage />
    <Footer />
    <CartDrawer />
  </>
)

function AppContent() {
  return (
    <Routes>
      {/* Storefront */}
      <Route path="/" element={<StorefrontLayout />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/collections" element={<CategoryPage />} />
      <Route path="/collections/:category" element={<CategoryPage />} />
      <Route path="/new-arrivals" element={<CategoryPage />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-confirmed" element={<OrderConfirmation />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<AddProduct />} />
        <Route path="orders" element={<Orders />} />
        <Route path="reels" element={<ReelsManager />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <div className="app">
              <AppContent />
            </div>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
