import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { ordersAPI } from '../services/api'
import Navbar from '../components/Navbar'
import {
  MapPin, CreditCard, CheckCircle, ChevronRight, Lock, Truck,
  RotateCcw, ShieldCheck, Tag, X, AlertCircle, Package, Zap,
  Smartphone, ArrowRight, RefreshCw,
} from 'lucide-react'
import './CheckoutPage.css'

const STEPS = [
  { id: 1, label: 'Verify', icon: Smartphone },
  { id: 2, label: 'Shipping', icon: MapPin },
  { id: 3, label: 'Payment', icon: CreditCard },
]

/* ─── API helper for Shiprocket OTP ─── */
function buildUrl(endpoint) {
  const IS_PRODUCTION = window.location.protocol === 'https:'
  if (IS_PRODUCTION) {
    return `/api-proxy.php?path=${encodeURIComponent(endpoint)}`
  }
  return `http://35.244.35.135:6000${endpoint}`
}

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cartItems, cartSubtotal, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [placing, setPlacing] = useState(false)

  // OTP state
  const [otpPhone, setOtpPhone] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [otpValue, setOtpValue] = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [savedAddresses, setSavedAddresses] = useState([])
  const [countdown, setCountdown] = useState(0)
  const otpInputRef = useRef(null)

  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', apartment: '', city: '', state: '', pincode: '',
    saveInfo: true,
  })

  const [payment, setPayment] = useState({
    method: 'razorpay',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [currentStep])

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

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
  const baseTotal = cartSubtotal - discount + shippingCost
  const PREPAID_DISCOUNT = 70
  const COD_CHARGE = 20
  const total = payment.method === 'razorpay' ? baseTotal - PREPAID_DISCOUNT : baseTotal + COD_CHARGE

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

  /* ─── OTP Functions ─── */
  const handleSendOTP = async () => {
    const phone = otpPhone.replace(/\D/g, '').replace(/^91/, '')
    if (phone.length !== 10) {
      setOtpError('Please enter a valid 10-digit phone number')
      return
    }
    setOtpError('')
    setOtpSending(true)
    try {
      const res = await fetch(buildUrl('/api/shiprocket/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (data.success && data.token) {
        setOtpToken(data.token)
        setOtpSent(true)
        setCountdown(30)
        setTimeout(() => otpInputRef.current?.focus(), 100)
      } else {
        setOtpError(data.message || 'Failed to send OTP. Try again.')
      }
    } catch (err) {
      setOtpError('Network error. Please try again.')
    }
    setOtpSending(false)
  }

  const handleVerifyOTP = async () => {
    if (otpValue.length < 4) {
      setOtpError('Please enter the complete OTP')
      return
    }
    setOtpError('')
    setOtpVerifying(true)
    try {
      const res = await fetch(buildUrl('/api/shiprocket/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otpToken, otp: otpValue }),
      })
      const data = await res.json()
      if (data.success && data.verified) {
        setOtpVerified(true)
        const cleanPhone = otpPhone.replace(/\D/g, '').replace(/^91/, '')
        setShipping(prev => ({ ...prev, phone: cleanPhone }))

        // Auto-fill from saved addresses if available
        if (data.addresses && data.addresses.length > 0) {
          setSavedAddresses(data.addresses)
          const addr = data.addresses[0]
          setShipping(prev => ({
            ...prev,
            phone: cleanPhone,
            firstName: addr.first_name || addr.name?.split(' ')[0] || prev.firstName,
            lastName: addr.last_name || addr.name?.split(' ').slice(1).join(' ') || prev.lastName,
            address: addr.address || addr.address_1 || prev.address,
            apartment: addr.address_2 || prev.apartment,
            city: addr.city || prev.city,
            state: addr.state || prev.state,
            pincode: addr.pincode || addr.zip || prev.pincode,
            email: addr.email || prev.email,
          }))
        }

        // Auto-advance to shipping step
        setTimeout(() => setCurrentStep(2), 600)
      } else {
        setOtpError(data.message || 'Invalid OTP. Please try again.')
      }
    } catch (err) {
      setOtpError('Network error. Please try again.')
    }
    setOtpVerifying(false)
  }

  const handleSelectAddress = (addr) => {
    setShipping(prev => ({
      ...prev,
      firstName: addr.first_name || addr.name?.split(' ')[0] || prev.firstName,
      lastName: addr.last_name || addr.name?.split(' ').slice(1).join(' ') || prev.lastName,
      address: addr.address || addr.address_1 || prev.address,
      apartment: addr.address_2 || prev.apartment,
      city: addr.city || prev.city,
      state: addr.state || prev.state,
      pincode: addr.pincode || addr.zip || prev.pincode,
      email: addr.email || prev.email,
    }))
  }

  const handleSkipOTP = () => {
    setCurrentStep(2)
  }

  /* ─── Validation ─── */
  const validateShipping = () => {
    const errs = {}
    if (!shipping.firstName.trim()) errs.firstName = 'First name is required'
    if (!shipping.lastName.trim()) errs.lastName = 'Last name is required'
    if (shipping.email.trim() && !/\S+@\S+\.\S+/.test(shipping.email)) errs.email = 'Please enter a valid email'
    if (!shipping.phone.trim() || shipping.phone.length < 10) errs.phone = 'Valid phone number is required'
    if (!shipping.address.trim()) errs.address = 'Address is required'
    if (!shipping.city.trim()) errs.city = 'City is required'
    if (!shipping.state.trim()) errs.state = 'State is required'
    if (!shipping.pincode.trim() || shipping.pincode.length < 6) errs.pincode = 'Valid pincode is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validatePayment = () => {
    // Razorpay handles its own validation, COD needs no validation
    return true
  }

  const handleNext = () => {
    if (currentStep === 2 && validateShipping()) setCurrentStep(3)
  }

  // ─── Razorpay Integration ───
  const RAZORPAY_KEY = 'rzp_live_TBI7uKecttibrI' // Live Razorpay Key

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.id = 'razorpay-script'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleRazorpayPayment = async () => {
    const loaded = await loadRazorpayScript()
    if (!loaded) {
      alert('Failed to load Razorpay. Check your internet connection.')
      return
    }

    setPlacing(true)

    // Step 1: Create order on backend
    try {
      const IS_PRODUCTION = window.location.protocol === 'https:'
      const createOrderUrl = IS_PRODUCTION
        ? `/api-proxy.php?path=${encodeURIComponent('/api/payment/create-order')}`
        : `http://35.244.35.135:6000/api/payment/create-order`

      const res = await fetch(createOrderUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      })

      if (!res.ok) throw new Error('Failed to create order')
      const orderData = await res.json()

      setPlacing(false)

      // Step 2: Open Razorpay checkout with order_id
      const options = {
        key: RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Tarik Clothing',
        description: `Order - ${cartItems.length} item(s)`,
        image: 'https://tarikclothing.com/favicon.ico',
        order_id: orderData.order_id,
        handler: function (response) {
          // Payment successful
          setPlacing(true)
          const order = {
            customer_name: `${shipping.firstName} ${shipping.lastName}`,
            email: shipping.email || '',
            phone: shipping.phone,
            address: shipping.address,
            city: shipping.city,
            state: shipping.state,
            pincode: shipping.pincode,
            items: cartItems.map(i => ({ id: i.id, name: i.name, qty: i.quantity, price: i.price, size: i.selectedSize, color: i.selectedColor })),
            item_count: cartItems.reduce((sum, i) => sum + i.quantity, 0),
            subtotal: cartSubtotal,
            discount,
            shipping_cost: shippingCost,
            total,
            prepaid_discount: PREPAID_DISCOUNT,
            payment_method: 'razorpay',
            payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
          }
          ordersAPI.create(order)
            .then(() => { clearCart(); navigate('/order-confirmed') })
            .catch(() => { clearCart(); navigate('/order-confirmed') })
        },
        prefill: {
          name: `${shipping.firstName} ${shipping.lastName}`,
          email: shipping.email || '',
          contact: shipping.phone,
        },
        theme: {
          color: '#c9a96e',
        },
        modal: {
          ondismiss: function () {
            setPlacing(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        alert('Oops! Something went wrong.\nPayment Failed')
        setPlacing(false)
      })
      rzp.open()
    } catch (err) {
      setPlacing(false)
      alert('Could not initiate payment. Please try again.')
      console.error(err)
    }
  }

  const updateShipping = (key, value) => {
    setShipping(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }))
  }

  const updatePayment = (key, value) => {
    setPayment(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }))
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

              {/* STEP 1: PHONE OTP VERIFICATION */}
              {currentStep === 1 && (
                <div className="checkout__card checkout__card--animate">
                  <h2 className="checkout__card-title"><Smartphone size={20} /> Verify Your Phone</h2>
                  <p className="checkout__otp-subtitle">
                    Enter your phone number to receive a verification code. Returning customers get their address auto-filled!
                  </p>

                  {!otpSent ? (
                    /* Phone Input */
                    <div className="checkout__otp-section">
                      <div className="checkout__otp-phone-wrap">
                        <span className="checkout__otp-country">+91</span>
                        <input
                          type="tel"
                          value={otpPhone}
                          onChange={e => { setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setOtpError('') }}
                          placeholder="Enter 10-digit mobile number"
                          className="checkout__otp-phone-input"
                          maxLength={10}
                          autoFocus
                        />
                      </div>
                      {otpError && <span className="checkout__otp-error"><AlertCircle size={14} /> {otpError}</span>}
                      <button
                        className="btn btn-primary btn-lg checkout__otp-send-btn"
                        onClick={handleSendOTP}
                        disabled={otpSending || otpPhone.length < 10}
                      >
                        {otpSending ? <span className="checkout__spinner"></span> : <><ArrowRight size={16} /> Send OTP</>}
                      </button>
                      <p className="checkout__otp-consent">
                        <ShieldCheck size={14} /> By verifying, you agree to retrieve saved addresses via Shiprocket for faster checkout.
                      </p>
                    </div>
                  ) : !otpVerified ? (
                    /* OTP Input */
                    <div className="checkout__otp-section">
                      <p className="checkout__otp-sent-msg">
                        <CheckCircle size={16} className="checkout__otp-sent-icon" /> OTP sent to <strong>+91 {otpPhone}</strong>
                      </p>
                      <div className="checkout__otp-input-wrap">
                        <input
                          ref={otpInputRef}
                          type="text"
                          value={otpValue}
                          onChange={e => { setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError('') }}
                          placeholder="Enter OTP"
                          className="checkout__otp-code-input"
                          maxLength={6}
                        />
                      </div>
                      {otpError && <span className="checkout__otp-error"><AlertCircle size={14} /> {otpError}</span>}
                      <button
                        className="btn btn-primary btn-lg checkout__otp-verify-btn"
                        onClick={handleVerifyOTP}
                        disabled={otpVerifying || otpValue.length < 4}
                      >
                        {otpVerifying ? <span className="checkout__spinner"></span> : <><ShieldCheck size={16} /> Verify OTP</>}
                      </button>
                      <div className="checkout__otp-resend">
                        {countdown > 0 ? (
                          <span className="checkout__otp-countdown">Resend in {countdown}s</span>
                        ) : (
                          <button className="checkout__otp-resend-btn" onClick={handleSendOTP} disabled={otpSending}>
                            <RefreshCw size={14} /> Resend OTP
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Verified */
                    <div className="checkout__otp-section checkout__otp-verified">
                      <div className="checkout__otp-verified-badge">
                        <CheckCircle size={32} />
                        <span>Phone Verified!</span>
                      </div>
                      <p>Proceeding to shipping details...</p>
                    </div>
                  )}

                  <button className="checkout__otp-skip" onClick={handleSkipOTP}>
                    Skip verification →
                  </button>
                </div>
              )}

              {/* STEP 2: SHIPPING */}
              {currentStep === 2 && (
                <div className="checkout__card checkout__card--animate">
                  <h2 className="checkout__card-title"><MapPin size={20} /> Shipping Information</h2>

                  {/* Saved addresses from Shiprocket */}
                  {savedAddresses.length > 1 && (
                    <div className="checkout__saved-addresses">
                      <p className="checkout__saved-label">📦 Saved Addresses</p>
                      {savedAddresses.map((addr, i) => (
                        <button
                          key={i}
                          className="checkout__saved-addr-btn"
                          onClick={() => handleSelectAddress(addr)}
                        >
                          <strong>{addr.first_name || addr.name || 'Address'} {addr.last_name || ''}</strong>
                          <span>{addr.address || addr.address_1}, {addr.city}, {addr.state} - {addr.pincode || addr.zip}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="checkout__row">
                    <div className="checkout__field">
                      <label>First Name *</label>
                      <input type="text" value={shipping.firstName} onChange={e => updateShipping('firstName', e.target.value)} placeholder="Rahul" className={errors.firstName ? 'checkout__input--error' : ''} />
                      {errors.firstName && <span className="checkout__error">{errors.firstName}</span>}
                    </div>
                    <div className="checkout__field">
                      <label>Last Name *</label>
                      <input type="text" value={shipping.lastName} onChange={e => updateShipping('lastName', e.target.value)} placeholder="Sharma" className={errors.lastName ? 'checkout__input--error' : ''} />
                      {errors.lastName && <span className="checkout__error">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="checkout__row">
                    <div className="checkout__field">
                      <label>Email (Optional)</label>
                      <input type="email" value={shipping.email} onChange={e => updateShipping('email', e.target.value)} placeholder="rahul@example.com" className={errors.email ? 'checkout__input--error' : ''} />
                      {errors.email && <span className="checkout__error">{errors.email}</span>}
                    </div>
                    <div className="checkout__field">
                      <label>Phone *</label>
                      <input
                        type="tel"
                        value={shipping.phone}
                        onChange={e => updateShipping('phone', e.target.value)}
                        placeholder="+91 9876543210"
                        className={errors.phone ? 'checkout__input--error' : ''}
                        readOnly={otpVerified}
                        style={otpVerified ? { background: '#1a1f2e', opacity: 0.7 } : {}}
                      />
                      {otpVerified && <span style={{ color: '#2ecc71', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><CheckCircle size={12} /> Verified</span>}
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

                  <div className="checkout__nav-btns">
                    <button className="btn btn-outline" onClick={() => setCurrentStep(1)}>Back</button>
                    <button className="btn btn-primary btn-lg checkout__next" onClick={handleNext}>
                      Continue to Payment <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT */}
              {currentStep === 3 && (
                <div className="checkout__card checkout__card--animate">
                  <h2 className="checkout__card-title"><CreditCard size={20} /> Payment Method</h2>

                  <div className="checkout__payment-methods">
                    <label className={`checkout__pay-option ${payment.method === 'razorpay' ? 'checkout__pay-option--active' : ''}`}>
                      <input type="radio" name="payment" value="razorpay" checked={payment.method === 'razorpay'} onChange={() => updatePayment('method', 'razorpay')} />
                      <Zap size={18} />
                      <div>
                        <span>Pay Online <span style={{ color: '#2ecc71', fontWeight: 700, fontSize: '13px' }}>— Save ₹{PREPAID_DISCOUNT}</span></span>
                        <small>Cards, UPI, Wallets, Net Banking</small>
                      </div>
                    </label>
                    <label className={`checkout__pay-option ${payment.method === 'cod' ? 'checkout__pay-option--active' : ''}`}>
                      <input type="radio" name="payment" value="cod" checked={payment.method === 'cod'} onChange={() => updatePayment('method', 'cod')} />
                      <Package size={18} />
                      <div>
                        <span>Cash on Delivery <span style={{ color: '#e67e22', fontSize: '13px' }}>+₹{COD_CHARGE}</span></span>
                        <small>Pay when you receive</small>
                      </div>
                    </label>
                  </div>

                  {payment.method === 'razorpay' && (
                    <div className="checkout__razorpay-note">
                      <ShieldCheck size={16} />
                      <p>You'll be redirected to Razorpay's secure payment page after reviewing your order. All major cards, UPI, wallets & net banking accepted.</p>
                    </div>
                  )}

                  {payment.method === 'cod' && (
                    <div className="checkout__cod-note">
                      <AlertCircle size={16} />
                      <p>A handling fee of ₹{COD_CHARGE} will be charged for Cash on Delivery orders.</p>
                    </div>
                  )}

                  <div className="checkout__nav-btns">
                    <button className="btn btn-outline" onClick={() => setCurrentStep(2)}>Back</button>
                    <button
                      className={`btn btn-primary btn-lg checkout__place-order ${placing ? 'checkout__place-order--placing' : ''}`}
                      onClick={() => {
                        if (payment.method === 'razorpay') {
                          handleRazorpayPayment()
                        } else {
                          // COD order
                          setPlacing(true)
                          const orderData = {
                            customer_name: `${shipping.firstName} ${shipping.lastName}`,
                            email: shipping.email || '',
                            phone: shipping.phone,
                            address: shipping.address,
                            city: shipping.city,
                            state: shipping.state,
                            pincode: shipping.pincode,
                            items: cartItems.map(i => ({ id: i.id, name: i.name, qty: i.quantity, price: i.price, size: i.selectedSize, color: i.selectedColor })),
                            item_count: cartItems.reduce((sum, i) => sum + i.quantity, 0),
                            subtotal: cartSubtotal,
                            discount,
                            shipping_cost: shippingCost,
                            total,
                            cod_charge: COD_CHARGE,
                            payment_method: 'cod',
                          }
                          ordersAPI.create(orderData)
                            .then(() => { clearCart(); navigate('/order-confirmed') })
                            .catch(() => { clearCart(); navigate('/order-confirmed') })
                        }
                      }}
                      disabled={placing}
                    >
                      {placing ? (
                        <span className="checkout__spinner"></span>
                      ) : payment.method === 'razorpay' ? (
                        <><Zap size={16} /> Pay ₹{total.toLocaleString()} with Razorpay</>
                      ) : (
                        <><Lock size={16} /> Place COD Order — ₹{total.toLocaleString()}</>
                      )}
                    </button>
                  </div>
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
                  {payment.method === 'razorpay' && (
                    <div className="checkout__total-row" style={{ color: '#2ecc71' }}>
                      <span>Prepaid Discount</span>
                      <span>-₹{PREPAID_DISCOUNT}</span>
                    </div>
                  )}
                  {payment.method === 'cod' && (
                    <div className="checkout__total-row" style={{ color: '#e67e22' }}>
                      <span>COD Handling Fee</span>
                      <span>+₹{COD_CHARGE}</span>
                    </div>
                  )}
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

