import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import './CartDrawer.css'

const CartDrawer = () => {
  const { cartItems, cartCount, cartSubtotal, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart()

  useEffect(() => {
    if (isCartOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isCartOpen])

  if (!isCartOpen) return null

  return (
    <div className="cart-drawer" id="cart-drawer">
      <div className="cart-drawer__overlay" onClick={() => setIsCartOpen(false)}></div>
      <div className="cart-drawer__panel">
        {/* Header */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__title">
            <ShoppingBag size={20} />
            <span>Your Cart ({cartCount})</span>
          </div>
          <button className="cart-drawer__close" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        {cartItems.length === 0 ? (
          <div className="cart-drawer__empty">
            <ShoppingBag size={56} />
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet</p>
            <button className="btn btn-primary" onClick={() => setIsCartOpen(false)}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {cartItems.map((item, i) => (
                <div className="cart-drawer__item" key={`${item.id}-${item.size}-${item.color}`}>
                  <img src={item.image} alt={item.name} className="cart-drawer__item-img" />
                  <div className="cart-drawer__item-info">
                    <h4 className="cart-drawer__item-name">{item.name}</h4>
                    <div className="cart-drawer__item-meta">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                    <div className="cart-drawer__item-bottom">
                      <div className="cart-drawer__qty">
                        <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}>
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="cart-drawer__item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                  <button className="cart-drawer__item-remove" onClick={() => removeFromCart(item.id, item.size, item.color)} aria-label="Remove">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="cart-drawer__footer">
              <div className="cart-drawer__subtotal">
                <span>Subtotal</span>
                <span>₹{cartSubtotal.toLocaleString()}</span>
              </div>
              <p className="cart-drawer__shipping-note">Shipping & taxes calculated at checkout</p>
              <Link to="/checkout" className="btn btn-primary btn-lg cart-drawer__checkout" id="checkout-btn" onClick={() => setIsCartOpen(false)}>
                Checkout <ArrowRight size={18} />
              </Link>
              <button className="cart-drawer__continue" onClick={() => setIsCartOpen(false)}>
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CartDrawer
