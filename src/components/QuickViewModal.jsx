import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import {
  X, Star, Heart, ShoppingBag, Minus, Plus, Check,
  Truck, RotateCcw, ArrowRight, ChevronLeft, ChevronRight,
} from 'lucide-react'
import './QuickViewModal.css'

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart()

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [sizeError, setSizeError] = useState(false)

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(0)
      setSelectedSize('')
      setSelectedColor(product.colors?.[0] || '')
      setQuantity(1)
      setAddedToCart(false)
      setSizeError(false)
    }
  }, [product])

  // Lock body scroll & ESC key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
      window.addEventListener('keydown', handleEsc)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleEsc)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  const images = product.images || [product.image]
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : product.originalPrice
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0
  const comparePrice = product.comparePrice || product.originalPrice || null

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      setSizeError(true)
      return
    }
    addToCart(product, selectedSize, selectedColor, quantity)
    setAddedToCart(true)
    setTimeout(() => {
      onClose()
      setAddedToCart(false)
    }, 800)
  }

  return (
    <div className="qv" id="quick-view-modal">
      <div className="qv__backdrop" onClick={onClose}></div>

      <div className="qv__dialog">
        {/* Close */}
        <button className="qv__close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="qv__body">
          {/* ── Left: Images ── */}
          <div className="qv__gallery">
            <div className="qv__main-image">
              <img src={images[selectedImage]} alt={product.name} />
              {discount > 0 && <span className="qv__discount-badge">-{discount}%</span>}

              {images.length > 1 && (
                <>
                  <button className="qv__img-nav qv__img-nav--prev" onClick={() => setSelectedImage(i => Math.max(0, i - 1))} disabled={selectedImage === 0}>
                    <ChevronLeft size={18} />
                  </button>
                  <button className="qv__img-nav qv__img-nav--next" onClick={() => setSelectedImage(i => Math.min(images.length - 1, i + 1))} disabled={selectedImage === images.length - 1}>
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="qv__thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`qv__thumb ${selectedImage === i ? 'qv__thumb--active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info ── */}
          <div className="qv__info">
            <span className="qv__category">{product.category}{product.subcategory ? ` / ${product.subcategory}` : ''}</span>
            <h2 className="qv__name">{product.name}</h2>

            {/* Rating */}
            <div className="qv__rating">
              <div className="qv__stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.floor(product.rating) ? '#c9a96e' : 'transparent'} stroke={i < Math.floor(product.rating) ? '#c9a96e' : '#555'} />
                ))}
              </div>
              <span>{product.rating}</span>
              <span className="qv__rating-count">({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="qv__pricing">
              <span className="qv__price">₹{product.price.toLocaleString()}</span>
              {comparePrice && (
                <>
                  <span className="qv__compare">₹{comparePrice.toLocaleString()}</span>
                  <span className="qv__save">Save {discount}%</span>
                </>
              )}
            </div>

            <p className="qv__tax">Inclusive of all taxes</p>
            <div className="qv__divider"></div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="qv__option">
                <label>Color: <strong>{selectedColor}</strong></label>
                <div className="qv__colors">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      className={`qv__color-btn ${selectedColor === color ? 'qv__color-btn--active' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                      {selectedColor === color && <Check size={11} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="qv__option">
                <label>Size: <strong>{selectedSize || 'Select'}</strong></label>
                <div className="qv__sizes">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`qv__size-btn ${selectedSize === size ? 'qv__size-btn--active' : ''} ${sizeError && !selectedSize ? 'qv__size-btn--error' : ''}`}
                      onClick={() => { setSelectedSize(size); setSizeError(false) }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizeError && <span className="qv__error">Please select a size</span>}
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="qv__actions">
              <div className="qv__quantity">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}><Minus size={15} /></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(10, q + 1))} disabled={quantity >= 10}><Plus size={15} /></button>
              </div>

              <button
                className={`qv__add-btn ${addedToCart ? 'qv__add-btn--added' : ''}`}
                onClick={handleAddToCart}
                id="qv-add-to-cart"
              >
                {addedToCart ? <><Check size={18} /> Added!</> : <><ShoppingBag size={18} /> Add to Cart</>}
              </button>

              <button
                className={`qv__wish-btn ${isWishlisted ? 'qv__wish-btn--active' : ''}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label="Wishlist"
              >
                <Heart size={20} fill={isWishlisted ? '#e74c3c' : 'none'} stroke={isWishlisted ? '#e74c3c' : 'currentColor'} />
              </button>
            </div>

            {/* Trust */}
            <div className="qv__trust">
              <span><Truck size={14} /> Free delivery on ₹999+</span>
              <span><RotateCcw size={14} /> 7-day easy returns</span>
            </div>

            {/* View Full */}
            <Link to={`/product/${product.id}`} className="qv__view-full" onClick={onClose}>
              View Full Details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickViewModal
