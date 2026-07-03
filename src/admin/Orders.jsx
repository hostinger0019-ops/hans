import { useState } from 'react'
import { useProducts } from '../context/ProductContext'
import { Search, Clock, Truck, CheckCircle, AlertCircle, Package } from 'lucide-react'
import './Orders.css'

const Orders = () => {
  const { orders, updateOrderStatus } = useProducts()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const statuses = ['All', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

  const filtered = orders.filter(o => {
    const matchSearch = o.customer.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'All' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={14} />
      case 'processing': return <AlertCircle size={14} />
      case 'shipped': return <Truck size={14} />
      case 'delivered': return <CheckCircle size={14} />
      default: return null
    }
  }

  const statusCounts = {
    All: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  return (
    <div className="orders-page" id="admin-orders">
      <div className="orders-page__header">
        <div>
          <h1 className="orders-page__title">Orders</h1>
          <p className="orders-page__subtitle">{orders.length} total orders</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="orders-page__tabs">
        {statuses.filter(s => s !== 'cancelled').map(status => (
          <button
            key={status}
            className={`orders-page__tab ${statusFilter === status ? 'orders-page__tab--active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="orders-page__tab-count">{statusCounts[status] || 0}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="orders-page__search-wrap">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search by order ID or customer name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="orders-page__search-input"
        />
      </div>

      {/* Orders Table */}
      <div className="orders-page__table-wrap">
        <table className="orders-page__table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order.id}>
                <td className="orders-page__order-id">{order.id}</td>
                <td>
                  <div className="orders-page__customer">
                    <div className="orders-page__customer-avatar">{order.customer.charAt(0)}</div>
                    <div>
                      <span className="orders-page__customer-name">{order.customer}</span>
                      <span className="orders-page__customer-loc">{order.address}</span>
                    </div>
                  </div>
                </td>
                <td>{order.items} items</td>
                <td className="orders-page__amount">₹{order.total.toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-badge--${order.status}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </td>
                <td className="orders-page__date">{order.date}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="orders-page__status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="orders-page__empty">
            <Package size={48} />
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
