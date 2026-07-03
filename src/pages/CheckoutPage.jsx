import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import {
  MapPin, CreditCard, CheckCircle, ChevronRight, Lock, Truck,
  RotateCcw, ShieldCheck, Tag, X, AlertCircle, Package,
} from 'lucide-react'
import './CheckoutPage.css'

const STEPS = [
  { id: 1, label: 'Shipping', icon: MapPin },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Review', icon: CheckCircle },
]

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cartItems, cartSubtotal, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [placing, setPlacing] = useState(false)

  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', apartment: '', city: '', state: '', pincode: '',
    saveInfo: true,
  })

  const [payment, setPayment] = useState({
    method: 'card',
    cardNumber: '', cardName: '', expiry: '', cvv: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [currentStep])

  // Redirect if cart empty
  if (cartItems.length === 0 && !placing) {
    return (
      <>
        <Navbar />
        <div className="checkout-empty">
          <Package size={64} />
          <h2>Your cart is empty</h2>
          <p>Add some products before checking out</p>
          <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </>
    )
  }

  /* ─── Calculations ─── */
  const discount = promoApplied ? Math.round(cartSubtotal * 0.1) : 0
  const shippingCost = cartSubtotal >= 999 ? 0 : 99
  const total = cartSubtotal - discount + shippingCost

  /* ─── Promo Code ─── */
  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'TARIK10') {
      setPromoApplied(true)
      setPromoError('')
    } else {
      setPromoError('Invalid promo code')
      setPromoApplied(false)
    }
  }

  /* ─── Validation ─── */
  const validateShipping = () => {
    const errs = {}
    if (!shipping.firstName.trim()) errs.firstName = 'First name is required'
    if (!shipping.lastName.trim()) errs.lastName = 'Last name is required'
    if (!shipping.email.trim() || !/\S+@\S+\.\S+/.test(shipping.email)) errs.email = 'Valid email is required'
    if (!shipping.phone.trim() || shipping.phone.length < 10) errs.phone = 'Valid phone number is required'
    if (!shipping.address.trim()) errs.address = 'Address is required'
    if (!shipping.city.trim()) errs.city = 'City is required'
    if (!shipping.state.trim()) errs.state = 'State is required'
    if (!shipping.pincode.trim() || shipping.pincode.length < 6) errs.pincode = 'Valid pincode is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validatePayment = () => {
    if (payment.method === 'cod') return true
    const errs = {}
    if (!payment.cardNumber.trim() || payment.cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'Valid card number is required'
    if (!payment.cardName.trim()) errs.cardName = 'Name on card is required'
    if (!payment.expiry.trim()) errs.expiry = 'Expiry date is required'
    if (!payment.cvv.trim() || payment.cvv.length < 3) errs.cvv = 'Valid CVV is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1 && validateShipping()) setCurrentStep(2)
    else if (currentStep === 2 && validatePayment()) setCurrentStep(3)
  }

  const handlePlaceOrder = () => {
    setPlacing(true)
    setTimeout(() => {
      clearCart()
      navigate('/order-confirmed')
    }, 1500)
  }

  const updateShipping = (key, value) => {
    setShipping(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }))
  }

  const updatePayment = (key, value) => {
    setPayment(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }))
  }

  const formatCardNumber = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 16)
    return clean.replace(/(.{4})/g, '$1 ').trim()
  }

  return (
    <>
      <Navbar />
      <main className="checkout" id="checkout-page">
        <div className="container">
          {/* ── Progress Steps ── */}
          <div className="checkout__steps">
            {STEPS.map((step, i) => (
              <div key={step.id} className={`checkout__step ${currentStep >= step.id ? 'checkout__step--active' : ''} ${currentStep > step.id ? 'checkout__step--done' : ''}`}>
                <div className="checkout__step-circle">
                  {currentStep > step.id ? <CheckCircle size={18} /> : <step.icon size={18} />}
                </div>
                <span className="checkout__step-label">{step.label}</span>
                {i < STEPS.length - 1 && <div className={`checkout__step-line ${currentStep > step.id ? 'checkout__step-line--active' : ''}`}></div>}
              </div>
            ))}
          </div>

          <div className="checkout__grid">
            {/* ════════ LEFT: FORM ════════ */}
            <div className="checkout__form-area">

              {/* STEP 1: SHIPPING */}
              {currentStep === 1 && (
                <div className="checkout__card checkout__card--animate">
                  <h2 className="checkout__card-title"><MapPin size={20} /> Shipping Information</h2>

                  <div className="checkout__row">
                    <div className="checkout__field">
                      <label>First Name *</label>
                      <input type="text" value={shipping.firstName} onChange={e => updateShipping('firstName', e.target.value)} placeholder="John" className={errors.firstName ? 'checkout__input--error' : ''} />
                      {errors.firstName && <span className="checkout__error">{errors.firstName}</span>}
                    </div>
                    <div className="checkout__field">
                      <label>Last Name *</label>
                      <input type="text" value={shipping.lastName} onChange={e => updateShipping('lastName', e.target.value)} placeholder="Doe" className={errors.lastName ? 'checkout__input--error' : ''} />
                      {errors.lastName && <span className="checkout__error">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="checkout__row">
                    <div className="checkout__field">
                      <label>Email *</label>
                      <input type="email" value={shipping.email} onChange={e => updateShipping('email', e.target.value)} placeholder="john@example.com" className={errors.email ? 'checkout__input--error' : ''} />
                      {errors.email && <span className="checkout__error">{errors.email}</span>}
                    </div>
                    <div className="checkout__field">
                      <label>Phone *</label>
                      <input type="tel" value={shipping.phone} onChange={e => updateShipping('phone', e.target.value)} placeholder="+91 9876543210" className={errors.phone ? 'checkout__input--error' : ''} />
                      {errors.phone && <span className="checkout__error">{errors.phone}</span>}
                    </div>
                  </div>

                  <div className="checkout__field">
                    <label>Address *</label>
                    <input type="text" value={shipping.address} onChange={e => updateShipping('address', e.target.value)} placeholder="123, Street Name" className={errors.address ? 'checkout__input--error' : ''} />
                    {errors.address && <span className="checkout__error">{errors.address}</span>}
                  </div>

                  <div className="checkout__field">
                    <label>Apartment / Suite (Optional)</label>
                    <input type="text" value={shipping.apartment} onChange={e => updateShipping('apartment', e.target.value)} placeholder="Apt 4B, Floor 2" />
                  </div>

                  <div className="checkout__row checkout__row--3">
                    <div className="checkout__field">
                      <label>City *</label>
                      <input type="text" value={shipping.city} onChange={e => updateShipping('city', e.target.value)} placeholder="Mumbai" className={errors.city ? 'checkout__input--error' : ''} />
                      {errors.city && <span className="checkout__error">{errors.city}</span>}
                    </div>
                    <div className="checkout__field">
                      <label>State *</label>
                      <input type="text" value={shipping.state} onChange={e => updateShipping('state', e.target.value)} placeholder="Maharashtra" className={errors.state ? 'checkout__input--error' : ''} />
                      {errors.state && <span className="checkout__error">{errors.state}</span>}
                    </div>
                    <div className="checkout__field">
                      <label>Pincode *</label>
                      <input type="text" value={shipping.pincode} onChange={e => updateShipping('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="400001" className={errors.pincode ? 'checkout__input--error' : ''} />
                      {errors.pincode && <span className="checkout__error">{errors.pincode}</span>}
                    </div>
                  </div>

                  <label className="checkout__checkbox">
                    <input type="checkbox" checked={shipping.saveInfo} onChange={e => updateShipping('saveInfo', e.target.checked)} />
                    <span>Save this information for next time</span>
                  </label>

                  <button className="btn btn-primary btn-lg checkout__next" onClick={handleNext}>
                    Continue to Payment <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {/* STEP 2: PAYMENT */}
              {currentStep === 2 && (
                <div className="checkout__card checkout__card--animate">
                  <h2 className="checkout__card-title"><CreditCard size={20} /> Payment Method</h2>

                  <div className="checkout__payment-methods">
                    <label className={`checkout__pay-option ${payment.method === 'card' ? 'checkout__pay-option--active' : ''}`}>
                      <input type="radio" name="payment" value="card" checked={payment.method === 'card'} onChange={() => updatePayment('method', 'card')} />
                      <CreditCard size={18} />
                      <div>
                        <span>Credit / Debit Card</span>
                        <small>Visa, Mastercard, RuPay</small>
                      </div>
                    </label>
                    <label className={`checkout__pay-option ${payment.method === 'upi' ? 'checkout__pay-option--active' : ''}`}>
                      <input type="radio" name="payment" value="upi" checked={payment.method === 'upi'} onChange={() => updatePayment('method', 'upi')} />
                      <span className="checkout__upi-icon">UPI</span>
                      <div>
                        <span>UPI Payment</span>
                        <small>Google Pay, PhonePe, Paytm</small>
                      </div>
                    </label>
                    <label className={`checkout__pay-option ${payment.method === 'cod' ? 'checkout__pay-option--active' : ''}`}>
                      <input type="radio" name="payment" value="cod" checked={payment.method === 'cod'} onChange={() => updatePayment('method', 'cod')} />
                      <Package size={18} />
                      <div>
                        <span>Cash on Delivery</span>
                        <small>Pay when you receive</small>
                      </div>
                    </label>
                  </div>

                  {payment.method === 'card' && (
                    <div className="checkout__card-form">
                      <div className="checkout__field">
                        <label>Card Number</label>
                        <input type="text" value={payment.cardNumber} onChange={e => updatePayment('cardNumber', formatCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} className={errors.cardNumber ? 'checkout__input--error' : ''} />
                        {errors.cardNumber && <span className="checkout__error">{errors.cardNumber}</span>}
                      </div>
                      <div className="checkout__field">
                        <label>Name on Card</label>
                        <input type="text" value={payment.cardName} onChange={e => updatePayment('cardName', e.target.value)} placeholder="JOHN DOE" className={errors.cardName ? 'checkout__input--error' : ''} />
                        {errors.cardName && <span className="checkout__error">{errors.cardName}</span>}
                      </div>
                      <div className="checkout__row">
                        <div className="checkout__field">
                          <label>Expiry Date</label>
                          <input type="text" value={payment.expiry} onChange={e => updatePayment('expiry', e.target.value)} placeholder="MM/YY" maxLength={5} className={errors.expiry ? 'checkout__input--error' : ''} />
                          {errors.expiry && <span className="checkout__error">{errors.expiry}</span>}
                        </div>
                        <div className="checkout__field">
                          <label>CVV</label>
                          <input type="password" value={payment.cvv} onChange={e => updatePayment('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" maxLength={4} className={errors.cvv ? 'checkout__input--error' : ''} />
                          {errors.cvv && <span className="checkout__error">{errors.cvv}</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {payment.method === 'upi' && (
                    <div className="checkout__upi-form">
                      <div className="checkout__field">
                        <label>UPI ID</label>
                        <input type="text" placeholder="name@upi" />
                      </div>
                    </div>
                  )}

                  {payment.method === 'cod' && (
                    <div className="checkout__cod-note">
                      <AlertCircle size={16} />
                      <p>A fee of ₹49 will be charged for Cash on Delivery orders.</p>
                    </div>
                  )}

                  <div className="checkout__nav-btns">
                    <button className="btn btn-outline" onClick={() => setCurrentStep(1)}>Back</button>
                    <button className="btn btn-primary btn-lg" onClick={handleNext}>
                      Review Order <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW */}
              {currentStep === 3 && (
                <div className="checkout__card checkout__card--animate">
                  <h2 className="checkout__card-title"><CheckCircle size={20} /> Review Your Order</h2>

                  {/* Shipping Summary */}
                  <div className="checkout__review-section">
                    <div className="checkout__review-header">
                      <h3>Shipping Address</h3>
                      <button className="checkout__review-edit" onClick={() => setCurrentStep(1)}>Edit</button>
                    </div>
                    <div className="checkout__review-content">
                      <p><strong>{shipping.firstName} {shipping.lastName}</strong></p>
                      <p>{shipping.address}{shipping.apartment ? `, ${shipping.apartment}` : ''}</p>
                      <p>{shipping.city}, {shipping.state} - {shipping.pincode}</p>
                      <p>{shipping.phone} • {shipping.email}</p>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="checkout__review-section">
                    <div className="checkout__review-header">
                      <h3>Payment Method</h3>
                      <button className="checkout__review-edit" onClick={() => setCurrentStep(2)}>Edit</button>
                    </div>
                    <div className="checkout__review-content">
                      {payment.method === 'card' && <p>💳 Card ending in {payment.cardNumber.slice(-4)}</p>}
                      {payment.method === 'upi' && <p>📱 UPI Payment</p>}
                      {payment.method === 'cod' && <p>📦 Cash on Delivery</p>}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="checkout__review-section">
                    <h3>Items ({cartItems.length})</h3>
                    <div className="checkout__review-items">
                      {cartItems.map(item => (
                        <div className="checkout__review-item" key={`${item.id}-${item.size}-${item.color}`}>
                          <img src={item.image} alt={item.name} />
                          <div className="checkout__review-item-info">
                            <span className="checkout__review-item-name">{item.name}</span>
                            <span className="checkout__review-item-meta">
                              {item.size && `Size: ${item.size}`} {item.color && `• Color: ${item.color}`} • Qty: {item.quantity}
                            </span>
                          </div>
                          <span className="checkout__review-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    className={`btn btn-primary btn-lg checkout__place-order ${placing ? 'checkout__place-order--placing' : ''}`}
                    onClick={handlePlaceOrder}
                    disabled={placing}
                  >
                    {placing ? (
                      <span className="checkout__spinner"></span>
                    ) : (
                      <><Lock size={16} /> Place Order — ₹{total.toLocaleString()}</>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* ════════ RIGHT: ORDER SUMMARY ════════ */}
            <aside className="checkout__summary">
              <div className="checkout__summary-card">
                <h3 className="checkout__summary-title">Order Summary</h3>

                {/* Items */}
                <div className="checkout__summary-items">
                  {cartItems.map(item => (
                    <div className="checkout__summary-item" key={`${item.id}-${item.size}-${item.color}`}>
                      <div className="checkout__summary-item-img">
                        <img src={item.image} alt={item.name} />
                        <span className="checkout__summary-item-qty">{item.quantity}</span>
                      </div>
                      <div className="checkout__summary-item-info">
                        <span className="checkout__summary-item-name">{item.name}</span>
                        <span className="checkout__summary-item-meta">{item.size} {item.color && `/ ${item.color}`}</span>
                      </div>
                      <span className="checkout__summary-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Promo */}
                <div className="checkout__promo">
                  {!promoApplied ? (
                    <div className="checkout__promo-input-wrap">
                      <Tag size={14} />
                      <input type="text" value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoError('') }} placeholder="Promo code" className="checkout__promo-input" />
                      <button className="checkout__promo-btn" onClick={applyPromo} disabled={!promoCode}>Apply</button>
                    </div>
                  ) : (
                    <div className="checkout__promo-applied">
                      <Tag size={14} />
                      <span>TARIK10 — 10% off</span>
                      <button onClick={() => { setPromoApplied(false); setPromoCode('') }}><X size={14} /></button>
                    </div>
                  )}
                  {promoError && <span className="checkout__promo-error">{promoError}</span>}
                </div>

                {/* Totals */}
                <div className="checkout__totals">
                  <div className="checkout__total-row">
                    <span>Subtotal</span>
                    <span>₹{cartSubtotal.toLocaleString()}</span>
                  </div>
                  {promoApplied && (
                    <div className="checkout__total-row checkout__total-row--discount">
                      <span>Discount (10%)</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="checkout__total-row">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? <span className="checkout__free">FREE</span> : `₹${shippingCost}`}</span>
                  </div>
                  <div className="checkout__total-row checkout__total-row--final">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Trust */}
                <div className="checkout__trust">
                  <div><Lock size={14} /> Secure 256-bit SSL encryption</div>
                  <div><Truck size={14} /> Free shipping on ₹999+</div>
                  <div><RotateCcw size={14} /> 7-day easy returns</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}

export default CheckoutPage
