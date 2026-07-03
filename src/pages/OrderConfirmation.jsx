import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Package, Truck, ArrowRight, Copy, Check } from 'lucide-react'
import Navbar from '../components/Navbar'
import './OrderConfirmation.css'

const OrderConfirmation = () => {
  const [copied, setCopied] = useState(false)
  const orderId = `TRK-${Date.now().toString(36).toUpperCase()}`

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const copyOrderId = () => {
    navigator.clipboard?.writeText(orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Navbar />
      <main className="order-confirm" id="order-confirmation">
        <div className="order-confirm__content">
          {/* Success Animation */}
          <div className="order-confirm__icon">
            <div className="order-confirm__icon-ring"></div>
            <div className="order-confirm__icon-ring order-confirm__icon-ring--2"></div>
            <CheckCircle size={56} />
          </div>

          <h1 className="order-confirm__title">Order Placed!</h1>
          <p className="order-confirm__desc">
            Thank you for shopping with Tarik Clothing. Your order has been confirmed and will be shipped shortly.
          </p>

          {/* Order ID */}
          <div className="order-confirm__order-id">
            <span>Order ID</span>
            <div className="order-confirm__id-copy">
              <strong>{orderId}</strong>
              <button onClick={copyOrderId} aria-label="Copy order ID">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="order-confirm__timeline">
            <div className="order-confirm__timeline-step order-confirm__timeline-step--done">
              <div className="order-confirm__timeline-dot"><CheckCircle size={16} /></div>
              <div>
                <span className="order-confirm__timeline-label">Order Confirmed</span>
                <span className="order-confirm__timeline-time">Just now</span>
              </div>
            </div>
            <div className="order-confirm__timeline-line"></div>
            <div className="order-confirm__timeline-step">
              <div className="order-confirm__timeline-dot"><Package size={16} /></div>
              <div>
                <span className="order-confirm__timeline-label">Processing</span>
                <span className="order-confirm__timeline-time">1-2 business days</span>
              </div>
            </div>
            <div className="order-confirm__timeline-line"></div>
            <div className="order-confirm__timeline-step">
              <div className="order-confirm__timeline-dot"><Truck size={16} /></div>
              <div>
                <span className="order-confirm__timeline-label">Shipped & Delivered</span>
                <span className="order-confirm__timeline-time">3-5 business days</span>
              </div>
            </div>
          </div>

          <p className="order-confirm__email-note">
            A confirmation email has been sent to your email address with the order details.
          </p>

          {/* Actions */}
          <div className="order-confirm__actions">
            <Link to="/shop" className="btn btn-primary btn-lg">
              Continue Shopping <ArrowRight size={18} />
            </Link>
            <Link to="/" className="btn btn-outline">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

export default OrderConfirmation
