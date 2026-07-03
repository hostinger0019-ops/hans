import { useProducts } from '../context/ProductContext'
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
} from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
  const { stats, orders, products } = useProducts()

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      change: '+12.5%',
      trend: 'up',
      color: '#2ecc71',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      change: '+8.3%',
      trend: 'up',
      color: '#3498db',
    },
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      change: `${stats.lowStock} low stock`,
      trend: stats.lowStock > 0 ? 'warning' : 'up',
      color: '#9b59b6',
    },
    {
      label: 'Customers',
      value: stats.totalCustomers,
      icon: Users,
      change: '+5.2%',
      trend: 'up',
      color: '#c9a96e',
    },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={14} />
      case 'processing': return <AlertCircle size={14} />
      case 'shipped': return <Truck size={14} />
      case 'delivered': return <CheckCircle size={14} />
      default: return null
    }
  }

  const getStatusClass = (status) => `status-badge status-badge--${status}`

  return (
    <div className="dashboard" id="admin-dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Welcome back! Here's what's happening with your store.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dashboard__stats">
        {statCards.map((stat, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-card__header">
              <span className="stat-card__label">{stat.label}</span>
              <div className="stat-card__icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="stat-card__value">{stat.value}</div>
            <div className={`stat-card__change stat-card__change--${stat.trend}`}>
              {stat.trend === 'up' ? <ArrowUpRight size={14} /> : stat.trend === 'warning' ? <AlertCircle size={14} /> : <ArrowDownRight size={14} />}
              <span>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="dashboard__grid">
        {/* Recent Orders */}
        <div className="dashboard__card dashboard__card--orders">
          <div className="dashboard__card-header">
            <h2>Recent Orders</h2>
            <a href="/admin/orders" className="dashboard__card-link">View All</a>
          </div>
          <div className="dashboard__table-wrap">
            <table className="dashboard__table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id}>
                    <td className="dashboard__order-id">{order.id}</td>
                    <td>
                      <div className="dashboard__customer">
                        <div className="dashboard__customer-avatar">{order.customer.charAt(0)}</div>
                        <div>
                          <span className="dashboard__customer-name">{order.customer}</span>
                          <span className="dashboard__customer-email">{order.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="dashboard__amount">₹{order.total.toLocaleString()}</td>
                    <td>
                      <span className={getStatusClass(order.status)}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="dashboard__date">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="dashboard__card dashboard__card--products">
          <div className="dashboard__card-header">
            <h2>Top Products</h2>
            <a href="/admin/products" className="dashboard__card-link">View All</a>
          </div>
          <div className="dashboard__product-list">
            {products.filter(p => p.featured).slice(0, 4).map(product => (
              <div className="dashboard__product-item" key={product.id}>
                <img src={product.images[0]} alt={product.name} className="dashboard__product-img" />
                <div className="dashboard__product-info">
                  <span className="dashboard__product-name">{product.name}</span>
                  <span className="dashboard__product-category">{product.category}</span>
                </div>
                <div className="dashboard__product-meta">
                  <span className="dashboard__product-price">₹{product.price.toLocaleString()}</span>
                  <span className="dashboard__product-stock">{product.stock} in stock</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="dashboard__card dashboard__card--quick">
          <div className="dashboard__card-header">
            <h2>Quick Stats</h2>
          </div>
          <div className="dashboard__quick-stats">
            <div className="dashboard__quick-item">
              <div className="dashboard__quick-bar" style={{ '--percent': '85%', '--bar-color': '#2ecc71' }}></div>
              <div className="dashboard__quick-info">
                <span>Published Products</span>
                <strong>{stats.publishedProducts}/{stats.totalProducts}</strong>
              </div>
            </div>
            <div className="dashboard__quick-item">
              <div className="dashboard__quick-bar" style={{ '--percent': '60%', '--bar-color': '#3498db' }}></div>
              <div className="dashboard__quick-info">
                <span>Delivered Orders</span>
                <strong>{stats.deliveredOrders}/{stats.totalOrders}</strong>
              </div>
            </div>
            <div className="dashboard__quick-item">
              <div className="dashboard__quick-bar" style={{ '--percent': `${stats.pendingOrders > 0 ? (stats.pendingOrders / stats.totalOrders * 100) : 0}%`, '--bar-color': '#e67e22' }}></div>
              <div className="dashboard__quick-info">
                <span>Pending Orders</span>
                <strong>{stats.pendingOrders}</strong>
              </div>
            </div>
            <div className="dashboard__quick-item">
              <div className="dashboard__quick-bar" style={{ '--percent': `${stats.lowStock > 0 ? '30%' : '0%'}`, '--bar-color': '#e74c3c' }}></div>
              <div className="dashboard__quick-info">
                <span>Low Stock Alerts</span>
                <strong>{stats.lowStock}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
