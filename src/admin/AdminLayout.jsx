import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Film,
  Plus,
  BarChart3,
} from 'lucide-react'
import './AdminLayout.css'

const AdminLayout = () => {
  const { adminUser, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/products/new', icon: Plus, label: 'Add Product' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/reels', icon: Film, label: 'Reels' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ]

  return (
    <div className="admin" id="admin-layout">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="admin__overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`admin__sidebar ${sidebarOpen ? 'admin__sidebar--open' : ''}`}>
        <div className="admin__sidebar-header">
          <a href="/" className="admin__logo">
            <span className="admin__logo-text">TARIK</span>
            <span className="admin__logo-divider"></span>
            <span className="admin__logo-sub">ADMIN</span>
          </a>
          <button className="admin__sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="admin__nav">
          <span className="admin__nav-label">Main Menu</span>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `admin__nav-link ${isActive ? 'admin__nav-link--active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin__sidebar-footer">
          <NavLink to="/admin/settings" className="admin__nav-link" onClick={() => setSidebarOpen(false)}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
          <button className="admin__nav-link admin__nav-link--logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
          <a href="/" className="admin__nav-link admin__nav-link--store" target="_blank">
            <span>🛍️</span>
            <span>View Store</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin__main">
        {/* Top Bar */}
        <header className="admin__topbar">
          <div className="admin__topbar-left">
            <button className="admin__mobile-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="admin__search">
              <Search size={18} />
              <input type="text" placeholder="Search products, orders..." className="admin__search-input" />
            </div>
          </div>

          <div className="admin__topbar-right">
            <button className="admin__notification" aria-label="Notifications">
              <Bell size={20} />
              <span className="admin__notification-dot"></span>
            </button>

            <div className="admin__profile" onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
              <div className="admin__profile-avatar">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="admin__profile-info">
                <span className="admin__profile-name">{adminUser?.name || 'Admin'}</span>
                <span className="admin__profile-role">Administrator</span>
              </div>
              <ChevronDown size={16} />

              {profileMenuOpen && (
                <div className="admin__profile-menu">
                  <a href="/" target="_blank" className="admin__profile-menu-item">View Store</a>
                  <button className="admin__profile-menu-item" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
