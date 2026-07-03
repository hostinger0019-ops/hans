import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProducts } from '../context/ProductContext'
import { useCart } from '../context/CartContext'
import {
  Heart, ShoppingBag, Star, ChevronLeft, ChevronRight,
  Minus, Plus, Share2, Truck, RotateCcw, ShieldCheck,
  ZoomIn, ChevronDown, ArrowRight, Check, Package,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import './ProductDetail.css'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, getProduct } = useProducts()
  const { addToCart } = useCart()

  const product = getProduct(id)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('details')
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const imageRef = useRef(null)

  // Extra images for gallery (since we have single images per product)
  const allImages = product ? [
    product.images[0],
    product.images[0],
    product.images[0],
    product.images[0],
  ] : []

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="pdp-not-found">
          <Package size={64} />
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
        </div>
        <Footer />
      </>
    )
  }

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0

  const relatedProducts = products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4)

  /* ─── Handlers ─── */
  const handleZoomMove = (e) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      setSizeError(true)
      return
    }
    addToCart(product, selectedSize, selectedColor, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleBuyNow = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      setSizeError(true)
      return
    }
    addToCart(product, selectedSize, selectedColor, quantity)
    // Navigate to checkout (placeholder for now)
  }

  const fakeReviews = [
    { id: 1, name: 'Aisha K.', rating: 5, date: '2 weeks ago', text: 'Absolutely love the quality! The fabric feels premium and the fit is perfect. Will definitely order again.', verified: true },
    { id: 2, name: 'Rahul S.', rating: 4, date: '1 month ago', text: 'Great product, exactly as shown in the pictures. Shipping was quick too. Just wish there were more color options.', verified: true },
    { id: 3, name: 'Priya P.', rating: 5, date: '3 weeks ago', text: 'Best purchase this season! The material is top notch and it looks even better in person. Highly recommend.', verified: false },
  ]

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="pdp" id="product-detail">
        {/* Breadcrumbs */}
        <div className="container">
          <nav className="pdp__breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/">Shop</Link>
            <span>/</span>
            <Link to="/">{product.category}</Link>
            <span>/</span>
            <span className="pdp__breadcrumbs-current">{product.name}</span>
          </nav>
        </div>

        {/* Product Section */}
        <section className="pdp__main container">
          {/* Image Gallery */}
          <div className="pdp__gallery">
            {/* Thumbnails */}
            <div className="pdp__thumbs">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  className={`pdp__thumb ${selectedImage === i ? 'pdp__thumb--active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img} alt={`View ${i + 1}`} />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div
              className={`pdp__image-main ${isZoomed ? 'pdp__image-main--zoomed' : ''}`}
              ref={imageRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleZoomMove}
            >
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                className="pdp__image"
                style={isZoomed ? {
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: 'scale(2)',
                } : {}}
              />
              {discount > 0 && <span className="pdp__image-badge">-{discount}% OFF</span>}
              <div className="pdp__image-zoom-hint">
                <ZoomIn size={14} /> Hover to zoom
              </div>

              {/* Image Navigation */}
              <button className="pdp__image-nav pdp__image-nav--prev" onClick={() => setSelectedImage(prev => Math.max(0, prev - 1))}>
                <ChevronLeft size={20} />
              </button>
              <button className="pdp__image-nav pdp__image-nav--next" onClick={() => setSelectedImage(prev => Math.min(allImages.length - 1, prev + 1))}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="pdp__info">
            {/* Category & Rating */}
            <div className="pdp__info-top">
              <span className="pdp__category">{product.category} / {product.subcategory}</span>
              {product.stock < 20 && (
                <span className="pdp__urgency">🔥 Only {product.stock} left!</span>
              )}
            </div>

            <h1 className="pdp__name">{product.name}</h1>

            <div className="pdp__rating">
              <div className="pdp__stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.floor(product.rating) ? '#c9a96e' : 'transparent'} stroke={i < Math.floor(product.rating) ? '#c9a96e' : '#666'} />
                ))}
              </div>
              <span className="pdp__rating-text">{product.rating} ({product.reviews} reviews)</span>
              <span className="pdp__rating-divider">|</span>
              <span className="pdp__sold">500+ sold</span>
            </div>

            {/* Price */}
            <div className="pdp__pricing">
              <span className="pdp__price">₹{product.price.toLocaleString()}</span>
              {product.comparePrice && (
                <>
                  <span className="pdp__compare-price">₹{product.comparePrice.toLocaleString()}</span>
                  <span className="pdp__discount-badge">Save {discount}%</span>
                </>
              )}
            </div>
            <p className="pdp__tax-note">Inclusive of all taxes. Free shipping on orders above ₹999.</p>

            {/* Divider */}
            <div className="pdp__divider"></div>

            {/* Color Selector */}
            {product.colors?.length > 0 && (
              <div className="pdp__option">
                <label className="pdp__option-label">
                  Color: <strong>{selectedColor || 'Select a color'}</strong>
                </label>
                <div className="pdp__colors">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      className={`pdp__color-btn ${selectedColor === color ? 'pdp__color-btn--active' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                    >
                      {color}
                      {selectedColor === color && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div className="pdp__option">
                <div className="pdp__option-header">
                  <label className="pdp__option-label">
                    Size: <strong>{selectedSize || 'Select a size'}</strong>
                  </label>
                  <button className="pdp__size-guide">Size Guide</button>
                </div>
                <div className="pdp__sizes">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`pdp__size-btn ${selectedSize === size ? 'pdp__size-btn--active' : ''} ${sizeError && !selectedSize ? 'pdp__size-btn--error' : ''}`}
                      onClick={() => { setSelectedSize(size); setSizeError(false) }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizeError && <span className="pdp__size-error">Please select a size</span>}
              </div>
            )}

            {/* Quantity */}
            <div className="pdp__option">
              <label className="pdp__option-label">Quantity</label>
              <div className="pdp__quantity">
                <button className="pdp__qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>
                  <Minus size={16} />
                </button>
                <span className="pdp__qty-value">{quantity}</span>
                <button className="pdp__qty-btn" onClick={() => setQuantity(q => Math.min(10, q + 1))} disabled={quantity >= 10}>
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pdp__actions">
              <button
                className={`pdp__add-to-cart ${addedToCart ? 'pdp__add-to-cart--added' : ''}`}
                onClick={handleAddToCart}
                id="add-to-cart-btn"
              >
                {addedToCart ? (
                  <><Check size={20} /> Added to Cart</>
                ) : (
                  <><ShoppingBag size={20} /> Add to Cart</>
                )}
              </button>
              <button className="pdp__buy-now" onClick={handleBuyNow} id="buy-now-btn">
                Buy Now <ArrowRight size={18} />
              </button>
              <button
                className={`pdp__wishlist ${isWishlisted ? 'pdp__wishlist--active' : ''}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label="Wishlist"
              >
                <Heart size={22} fill={isWishlisted ? '#e74c3c' : 'none'} stroke={isWishlisted ? '#e74c3c' : 'currentColor'} />
              </button>
            </div>

            {/* Trust Signals */}
            <div className="pdp__trust">
              <div className="pdp__trust-item">
                <Truck size={18} />
                <div>
                  <span>Free Delivery</span>
                  <small>On orders above ₹999</small>
                </div>
              </div>
              <div className="pdp__trust-item">
                <RotateCcw size={18} />
                <div>
                  <span>Easy Returns</span>
                  <small>7-day return policy</small>
                </div>
              </div>
              <div className="pdp__trust-item">
                <ShieldCheck size={18} />
                <div>
                  <span>Secure Payment</span>
                  <small>100% protected</small>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="pdp__share">
              <Share2 size={16} />
              <span>Share this product</span>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="pdp__tabs-section container">
          <div className="pdp__tabs">
            <button className={`pdp__tab ${activeTab === 'details' ? 'pdp__tab--active' : ''}`} onClick={() => setActiveTab('details')}>Details</button>
            <button className={`pdp__tab ${activeTab === 'sizeguide' ? 'pdp__tab--active' : ''}`} onClick={() => setActiveTab('sizeguide')}>Size Guide</button>
            <button className={`pdp__tab ${activeTab === 'reviews' ? 'pdp__tab--active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews ({product.reviews})</button>
          </div>

          <div className="pdp__tab-content">
            {activeTab === 'details' && (
              <div className="pdp__details-tab">
                <p>{product.description}</p>
                <div className="pdp__specs">
                  <h4>Product Details</h4>
                  <ul>
                    <li><span>Material</span><span>Premium Cotton Blend</span></li>
                    <li><span>Fit</span><span>Regular / Slim Fit</span></li>
                    <li><span>Care</span><span>Machine wash cold</span></li>
                    <li><span>Origin</span><span>Made in India</span></li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'sizeguide' && (
              <div className="pdp__sizeguide-tab">
                <h4>Size Guide</h4>
                <table className="pdp__size-table">
                  <thead>
                    <tr><th>Size</th><th>Chest (in)</th><th>Waist (in)</th><th>Length (in)</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>S</td><td>36</td><td>30</td><td>26</td></tr>
                    <tr><td>M</td><td>38</td><td>32</td><td>27</td></tr>
                    <tr><td>L</td><td>40</td><td>34</td><td>28</td></tr>
                    <tr><td>XL</td><td>42</td><td>36</td><td>29</td></tr>
                    <tr><td>XXL</td><td>44</td><td>38</td><td>30</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="pdp__reviews-tab">
                <div className="pdp__reviews-summary">
                  <div className="pdp__reviews-big-rating">
                    <span className="pdp__reviews-number">{product.rating}</span>
                    <div className="pdp__reviews-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill={i < Math.floor(product.rating) ? '#c9a96e' : 'transparent'} stroke={i < Math.floor(product.rating) ? '#c9a96e' : '#666'} />
                      ))}
                    </div>
                    <span className="pdp__reviews-count">Based on {product.reviews} reviews</span>
                  </div>
                </div>

                <div className="pdp__reviews-list">
                  {fakeReviews.map(review => (
                    <div className="pdp__review" key={review.id}>
                      <div className="pdp__review-header">
                        <div className="pdp__review-avatar">{review.name.charAt(0)}</div>
                        <div>
                          <span className="pdp__review-name">
                            {review.name}
                            {review.verified && <span className="pdp__review-verified">✓ Verified</span>}
                          </span>
                          <div className="pdp__review-stars">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill={i < review.rating ? '#c9a96e' : 'transparent'} stroke={i < review.rating ? '#c9a96e' : '#666'} />
                            ))}
                            <span className="pdp__review-date">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="pdp__review-text">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="pdp__related container">
            <h2 className="pdp__related-title">You May Also Like</h2>
            <div className="pdp__related-grid">
              {relatedProducts.map(rp => (
                <Link to={`/product/${rp.id}`} className="pdp__related-card" key={rp.id}>
                  <div className="pdp__related-img-wrap">
                    <img src={rp.images[0]} alt={rp.name} />
                  </div>
                  <div className="pdp__related-info">
                    <span className="pdp__related-category">{rp.category}</span>
                    <h3>{rp.name}</h3>
                    <div className="pdp__related-price">
                      <span>₹{rp.price.toLocaleString()}</span>
                      {rp.comparePrice && <span className="pdp__related-compare">₹{rp.comparePrice.toLocaleString()}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  )
}

export default ProductDetail
